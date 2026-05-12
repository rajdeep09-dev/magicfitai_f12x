import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Dynamic Pricing Calculation
    let final_price = data.base_price;
    const commissionRate = (data.base_price >= 100) ? 0.20 : 0.10;
    const commission = data.base_price * commissionRate;
    const tax = (data.base_price + commission) * 0.05;
    final_price = data.base_price + commission + tax;

    const payload = {
        ...data,
        final_price: final_price,
        campaign_id: '00000000-0000-0000-0000-000000000000'
    };

    let response;
    if (id) {
        response = await supabase.from('creators').update(payload).eq('id', id).select();
    } else {
        response = await supabase.from('creators').insert(payload).select();
    }

    if (response.error) throw response.error;
    return NextResponse.json({ success: true, creator: response.data[0] });
  } catch (error: any) {
    console.error('Save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}