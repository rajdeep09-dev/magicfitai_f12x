import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Creator } from '@/types/creator';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (creator: Partial<Creator>) => Promise<void>;
  creator?: Creator | null;
}

export default function CreatorModal({ isOpen, onClose, onSave, creator }: CreatorModalProps) {
  const { isEditor, isClient } = useAuth();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<Creator>>({
    creator_name: '',
    handle: '',
    lang: '',
    platform: 'Instagram',
    followers: 0,
    engagement_rate: 0,
    base_price: 0,
    approval_status: 'Ideation',
    campaign_id: '',
    draft_reel_url: '',
    video_link: '',
    published_video_link: '',
    recommended_for_batch: '',
    is_recommended: false,
    client_approved_creator: false,
    client_approved_video: false,
    include_agency_fee: true,
    include_processing_fee: true,
    payment_status: 'pending',
  });

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('campaigns').select('id, name');
        
        let allCampaigns = data || [];
        const defaultCampaign = { id: '00000000-0000-0000-0000-000000000000', name: 'Default Campaign' };
        
        // Add default campaign if not exists
        if (!allCampaigns.find(c => c.id === defaultCampaign.id)) {
            allCampaigns = [defaultCampaign, ...allCampaigns];
        }
        
        setCampaigns(allCampaigns);
      } catch (err) {
        console.error('Failed to load campaigns:', err);
      }
    }
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (creator) {
      setFormData({
        ...creator,
        include_agency_fee: creator.include_agency_fee ?? true,
        include_processing_fee: creator.include_processing_fee ?? true,
      });
    } else {
      setFormData({
        creator_name: '',
        platform: 'Instagram',
        deliverable: '',
        approval_status: 'Ideation',
        campaign_id: campaigns.length > 0 ? campaigns[0].id : '',
        base_price: 0,
        draft_reel_url: '',
        video_link: '',
        published_video_link: '',
        recommended_for_batch: '',        client_approved_creator: false,
        client_approved_video: false,
        include_agency_fee: true,
        include_processing_fee: true,
        payment_status: 'pending',
      });
    }
  }, [creator, isOpen, campaigns]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const base = formData.base_price || 0;
    const f12xFee = formData.include_agency_fee ? base * (base >= 100 ? 0.20 : 0.10) : 0;
    const payPalFee = formData.include_processing_fee ? (base + f12xFee) * 0.05 : 0;
    const final_price = base + f12xFee + payPalFee;

    const dataToSave = {
      ...formData,
      final_price,
      campaign_id: formData.campaign_id || '00000000-0000-0000-0000-000000000000',
      creator_name: formData.creator_name || formData.handle || 'Unknown',
      approval_status: formData.approval_status || 'Sourced',
      id: creator?.id 
    };
    
    await fetch('/api/creators/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dataToSave)
    });
    
    await onSave(dataToSave);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-neutral-950/95 backdrop-blur-2xl border border-white/10 text-neutral-50 overflow-y-auto max-h-[85vh] rounded-2xl shadow-2xl p-0">
        <div className="p-6 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">{creator ? 'Edit Creator' : 'Add New Creator'}</DialogTitle>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="handle" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Creator Handle (@)</Label>
              <Input
                id="handle"
                name="handle"
                value={formData.handle || ''}
                onChange={handleChange}
                required
                disabled={!isEditor}
                className="bg-neutral-900 border-white/10 focus:border-lime-400 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creator_name" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Display Name</Label>
              <Input
                id="creator_name"
                name="creator_name"
                value={formData.creator_name || ''}
                onChange={handleChange}
                disabled={!isEditor}
                className="bg-neutral-900 border-white/10 focus:border-lime-400 h-11"
              />
            </div>

            {isEditor && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="engagement_rate" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Engagement Rate (%)</Label>
                  <Input
                    id="engagement_rate"
                    name="engagement_rate"
                    type="number"
                    step="0.01"
                    value={formData.engagement_rate || 0}
                    onChange={handleChange}
                    disabled={!isEditor}
                    className="bg-neutral-900 border-white/10 focus:border-lime-400 h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="followers" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Followers</Label>
                  <Input
                    id="followers"
                    name="followers"
                    type="number"
                    value={formData.followers || 0}
                    onChange={handleChange}
                    disabled={!isEditor}
                    className="bg-neutral-900 border-white/10 focus:border-lime-400 h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="base_price" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Base Price ($)</Label>
                  <Input
                    id="base_price"
                    name="base_price"
                    type="number"
                    value={formData.base_price || 0}
                    onChange={handleChange}
                    disabled={!isEditor}
                    className="bg-neutral-900 border-white/10 focus:border-lime-400 h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recommended_for_batch" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Batch</Label>
                  <Input
                    id="recommended_for_batch"
                    name="recommended_for_batch"
                    value={formData.recommended_for_batch || ''}
                    onChange={handleChange}
                    disabled={!isEditor}
                    className="bg-neutral-900 border-white/10 focus:border-lime-400 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign_id" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Campaign</Label>
                  <select
                    id="campaign_id"
                    name="campaign_id"
                    value={formData.campaign_id || ''}
                    onChange={handleChange}
                    disabled={!isEditor}
                    className="flex h-11 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:border-lime-400"
                  >
                    <option value="">Select a Campaign</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Platform</Label>
                  <select
                    id="platform"
                    name="platform"
                    value={formData.platform || 'Instagram'}
                    onChange={handleChange}
                    disabled={!isEditor}
                    className="flex h-11 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:border-lime-400"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter">Twitter</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lang" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Language</Label>
                  <Input
                    id="lang"
                    name="lang"
                    value={formData.lang || ''}
                    onChange={handleChange}
                    disabled={!isEditor}
                    className="bg-neutral-900 border-white/10 focus:border-lime-400 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video_link" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Video Link</Label>
                  <Input
                    id="video_link"
                    name="video_link"
                    value={formData.video_link || ''}
                    onChange={handleChange}
                    disabled={!isEditor}
                    className="bg-neutral-900 border-white/10 focus:border-lime-400 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="published_video_link" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Published Link</Label>
                  <Input
                    id="published_video_link"
                    name="published_video_link"
                    value={formData.published_video_link || ''}
                    onChange={handleChange}
                    disabled={!isEditor}
                    className="bg-neutral-900 border-white/10 focus:border-lime-400 h-11"
                  />
                </div>

                <div className="col-span-2">
                   <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-lg border border-white/5">
                      <input
                        type="checkbox"
                        name="is_recommended"
                        checked={formData.is_recommended || false}
                        onChange={handleChange}
                        className="rounded border-neutral-700 text-lime-400 focus:ring-lime-400 bg-neutral-900"
                      />
                      <span className="text-sm font-bold text-lime-400">Recommend this Creator (F12X Pick)</span>
                    </label>
                </div>
              </>
            )}

            {(isEditor || isClient) && creator && (
              <div className="space-y-4 col-span-2 p-5 bg-white/5 rounded-xl border border-white/5">
                <h4 className="font-bold text-sm tracking-wide text-neutral-200">Pricing & Approval</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     {isEditor && (
                       <>
                         <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase text-neutral-400">
                            <input type="checkbox" name="include_agency_fee" checked={formData.include_agency_fee} onChange={handleChange} className="text-lime-400 rounded" />
                            Include Agency Fee
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase text-neutral-400">
                            <input type="checkbox" name="include_processing_fee" checked={formData.include_processing_fee} onChange={handleChange} className="text-lime-400 rounded" />
                            Include 5% Processing Fee
                         </label>
                       </>
                     )}
                  </div>
                  <div>
                    <Label className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Final Price</Label>
                    <p className="text-2xl font-black text-lime-400">
                      ${((formData.base_price || 0) + (formData.include_agency_fee ? (formData.base_price || 0) * ((formData.base_price || 0) >= 100 ? 0.2 : 0.1) : 0) + ((formData.base_price || 0) + (formData.include_agency_fee ? (formData.base_price || 0) * ((formData.base_price || 0) >= 100 ? 0.2 : 0.1) : 0)) * (formData.include_processing_fee ? 0.05 : 0)).toFixed(2)}
                    </p>
                  </div>
                </div>

                {isClient && formData.client_approved_video && formData.client_approved_creator && (
                  <div className="mt-2 pt-4 border-t border-white/5">
                    <Label htmlFor="payment_status" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Payment Action</Label>
                    <select
                      id="payment_status"
                      name="payment_status"
                      value={formData.payment_status || 'pending'}
                      onChange={handleChange}
                      className="flex h-11 w-full mt-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="waiting_for_tolt">Buy/Pay via Tolt.io (Wait for process)</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                )}
                
                {isEditor && (
                  <div className="mt-2 pt-4 border-t border-white/5">
                    <Label htmlFor="payment_status" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Payment Status (Editor)</Label>
                    <select
                      id="payment_status"
                      name="payment_status"
                      value={formData.payment_status || 'pending'}
                      onChange={handleChange}
                      className="flex h-11 w-full mt-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="waiting_for_tolt">Waiting for Tolt.io</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="mt-2 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="text-neutral-400 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-lime-400 text-neutral-950 hover:bg-lime-300 font-bold px-6">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
