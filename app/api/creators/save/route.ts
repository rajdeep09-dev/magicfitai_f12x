import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let response;
    if (id) {
        response = await supabase.from('creators').update(data).eq('id', id).select();
    } else {
        response = await supabase.from('creators').insert(data).select();
    }

    if (response.error) throw response.error;
    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}