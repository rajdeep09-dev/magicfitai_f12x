import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Dynamic Pricing Calculation based on toggles
    const base = Number(data.base_price) || 0;
    const payPalFee = data.include_processing_fee ? base * 0.05 : 0;
    const final_price = base + payPalFee;

    const dataToSave = {
      campaign_id: data.campaign_id,
        final_price,
        campaign_id: data.campaign_id || '00000000-0000-0000-0000-000000000000'
    };

    console.log('DEBUG: API Payload being saved:', payload);

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