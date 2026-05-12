import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { creatorId, action, note, isInternal } = await req.json();
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Get profile to check role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const role = profile?.role;

  try {
    if (action === 'approve') {
        if (role !== 'client') return NextResponse.json({ error: 'Only clients can approve' }, { status: 403 });
        await supabase.from('creators').update({ approval_status: 'Approved', client_approved_video: true }).eq('id', creatorId);
    } else if (action === 'revision') {
        await supabase.from('creators').update({ approval_status: 'Revisions Requested' }).eq('id', creatorId);
    } else if (action === 'toggle_recommend') {
        if (role !== 'editor') return NextResponse.json({ error: 'Only editors can recommend' }, { status: 403 });
        const { isRecommended } = await req.json();
        await supabase.from('creators').update({ is_recommended: isRecommended }).eq('id', creatorId);
    } else if (action === 'add_note') {
        // Logic to add note (if we had a notes table) - for now just log
        console.log('Adding note:', note, 'internal:', isInternal);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}