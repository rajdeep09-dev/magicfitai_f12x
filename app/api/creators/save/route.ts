import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const role = profile?.role;

    // Security Check: Clients can only approve and update payment status
    if (role === 'client') {
       if (!id) return NextResponse.json({ error: 'Forbidden: Clients cannot create creators' }, { status: 403 });
       
       const allowedClientPayload = {
          client_approved_creator: data.client_approved_creator,
          client_approved_video: data.client_approved_video,
          payment_status: data.payment_status,
       };

       const response = await supabase.from('creators').update(allowedClientPayload).eq('id', id).select();
       if (response.error) throw response.error;
       return NextResponse.json({ success: true, creator: response.data[0] });
    }

    if (role !== 'editor' && role !== 'admin') {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Dynamic Pricing Calculation based on toggles (Editors & Admins Only)
    const base = Number(data.base_price) || 0;
    const payPalFee = data.include_processing_fee ? base * 0.05 : 0;
    const final_price = base + payPalFee;

    const payload = {
      ...data,
      base_price: base,
      final_price,
      campaign_id: data.campaign_id || '00000000-0000-0000-0000-000000000000'
    };

    let response;
    if (id) {
        response = await supabase.from('creators').update(payload).eq('id', id).select();
    } else {
        response = await supabase.from('creators').insert(payload).select();
    }

    if (response.error) throw response.error;
    const updatedCreator = response.data[0];

    // Robustly recalculate the campaign budget spent total
    if (updatedCreator.campaign_id) {
        const { data: allApproved } = await supabase
            .from('creators')
            .select('final_price')
            .eq('campaign_id', updatedCreator.campaign_id)
            .eq('client_approved_creator', true);
            
        const newSpent = (allApproved || []).reduce((sum, c) => sum + (Number(c.final_price) || 0), 0);

        await supabase
            .from('campaign_budget')
            .update({ spent: newSpent })
            .eq('id', updatedCreator.campaign_id);
    }

    return NextResponse.json({ success: true, creator: updatedCreator });
  } catch (error: any) {
    console.error('Save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}