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
    const commissionRate = base >= 100 ? 0.20 : 0.10;
    const f12xFee = data.include_agency_fee ? base * commissionRate : 0;
    const payPalFee = data.include_processing_fee ? (base + f12xFee) * 0.05 : 0;
    const final_price = base + f12xFee + payPalFee;

    const payload = {
        ...data,
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

    // ... previous logic ...
    if (response.error) throw response.error;
    const updatedCreator = response.data[0];

    // Deduct from campaign budget if client_approved_creator becomes true
    if (updatedCreator.client_approved_creator === true) {
        const { data: budgetData } = await supabase
            .from('campaign_budget')
            .select('*')
            .eq('id', updatedCreator.campaign_id)
            .single();
        
        if (budgetData) {
            await supabase
                .from('campaign_budget')
                .update({ spent: Number(budgetData.spent || 0) + Number(updatedCreator.final_price) })
                .eq('id', budgetData.id);
        }
    }

    return NextResponse.json({ success: true, creator: updatedCreator });
  } catch (error: any) {
    console.error('Save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}