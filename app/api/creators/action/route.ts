import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { creatorId, action } = body;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const role = profile?.role;

  try {
    if (action === 'approve') {
        if (role !== 'client') return NextResponse.json({ error: 'Only clients can approve' }, { status: 403 });
        const { data: updatedCreator, error: updateError } = await supabase
            .from('creators')
            .update({ approval_status: 'Approved', client_approved_video: true })
            .eq('id', creatorId)
            .select()
            .single();
            
        if (updateError) throw updateError;
        return NextResponse.json({ success: true, creator: updatedCreator });
    } else if (action === 'revision') {
        const { data: updatedCreator, error: updateError } = await supabase
            .from('creators')
            .update({ approval_status: 'Revisions Requested' })
            .eq('id', creatorId)
            .select()
            .single();
            
        if (updateError) throw updateError;
        return NextResponse.json({ success: true, creator: updatedCreator });
    } else if (action === 'toggle_recommend') {
        if (role !== 'editor') return NextResponse.json({ error: 'Only editors can recommend' }, { status: 403 });
        const { isRecommended } = body; // Read from the already-parsed body
        await supabase.from('creators').update({ is_recommended: isRecommended }).eq('id', creatorId);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}