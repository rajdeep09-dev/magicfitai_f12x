import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { creatorId, content, isInternal } = await req.json();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('first_name, role').eq('id', user.id).single();

  const { error } = await supabase.from('notes').insert({
    creator_id: creatorId,
    author_id: user.id,
    author_name: profile?.first_name || 'User',
    author_role: profile?.role || 'client',
    content,
    is_internal: isInternal || false
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId');
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notes: data });
}
