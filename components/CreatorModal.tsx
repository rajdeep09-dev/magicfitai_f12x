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

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (creator: Partial<Creator>) => Promise<void>;
  creator?: Creator | null;
}

export default function CreatorModal({ isOpen, onClose, onSave, creator }: CreatorModalProps) {
  const { isEditor, isClient } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Creator>>({
    creator_name: '',
    platform: 'Instagram',
    deliverable: '',
    approval_status: 'Ideation',
    base_price: 0,
    draft_reel_url: '',
    recommended_for_batch: '',
    client_approved_creator: false,
    client_approved_video: false,
    payment_status: 'pending',
  });

  useEffect(() => {
    if (creator) {
      setFormData(creator);
    } else {
      setFormData({
        creator_name: '',
        platform: 'Instagram',
        deliverable: '',
        approval_status: 'Ideation',
        base_price: 0,
        draft_reel_url: '',
        recommended_for_batch: '',
        client_approved_creator: false,
        client_approved_video: false,
        payment_status: 'pending',
      });
    }
  }, [creator, isOpen]);

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
    
    // Calculate final price: base_price + 20% commission + 5% tax
    const base = formData.base_price || 0;
    const commission = base * 0.20;
    const tax = (base + commission) * 0.05;
    const final_price = base + commission + tax;

    const dataToSave = {
      ...formData,
      final_price,
    };
    
    await onSave(dataToSave);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-neutral-900 border-neutral-800 text-neutral-50 overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{creator ? 'Edit Creator' : 'Add New Creator'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creator_name">Creator Name</Label>
              <Input
                id="creator_name"
                name="creator_name"
                value={formData.creator_name || ''}
                onChange={handleChange}
                disabled={!isEditor && !!creator}
                required
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                name="platform"
                value={formData.platform || 'Instagram'}
                onChange={handleChange}
                disabled={!isEditor && !!creator}
                className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>

            {isEditor && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="base_price">Base Price ($)</Label>
                  <Input
                    id="base_price"
                    name="base_price"
                    type="number"
                    value={formData.base_price || 0}
                    onChange={handleChange}
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recommended_for_batch">Recommended Batch</Label>
                  <Input
                    id="recommended_for_batch"
                    name="recommended_for_batch"
                    value={formData.recommended_for_batch || ''}
                    onChange={handleChange}
                    className="bg-neutral-800 border-neutral-700"
                    placeholder="e.g. Batch 1"
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="draft_reel_url">Draft Reel URL</Label>
                  <Input
                    id="draft_reel_url"
                    name="draft_reel_url"
                    value={formData.draft_reel_url || ''}
                    onChange={handleChange}
                    className="bg-neutral-800 border-neutral-700"
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {(isEditor || isClient) && creator && (
              <div className="space-y-2 col-span-2 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                <h4 className="font-semibold mb-2">Pricing & Approval</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-neutral-400 text-xs">Final Price (Incl. 20% Comm + 5% Tax)</Label>
                    <p className="text-xl font-bold text-lime-400">
                      ${creator.final_price?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="client_approved_creator"
                        checked={formData.client_approved_creator || false}
                        onChange={handleChange}
                        disabled={!isClient}
                        className="rounded border-neutral-700 text-lime-400 focus:ring-lime-400 bg-neutral-800"
                      />
                      <span className="text-sm">Approve Creator</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="client_approved_video"
                        checked={formData.client_approved_video || false}
                        onChange={handleChange}
                        disabled={!isClient}
                        className="rounded border-neutral-700 text-lime-400 focus:ring-lime-400 bg-neutral-800"
                      />
                      <span className="text-sm">Approve Video</span>
                    </label>
                  </div>
                </div>

                {isClient && formData.client_approved_video && formData.client_approved_creator && (
                  <div className="mt-4">
                    <Label htmlFor="payment_status">Payment Action</Label>
                    <select
                      id="payment_status"
                      name="payment_status"
                      value={formData.payment_status || 'pending'}
                      onChange={handleChange}
                      className="flex h-10 w-full mt-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="waiting_for_tolt">Buy/Pay via Tolt.io (Wait for process)</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                )}
                
                {isEditor && (
                  <div className="mt-4">
                    <Label htmlFor="payment_status">Payment Status (Editor View)</Label>
                    <select
                      id="payment_status"
                      name="payment_status"
                      value={formData.payment_status || 'pending'}
                      onChange={handleChange}
                      className="flex h-10 w-full mt-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm"
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

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="bg-transparent border-neutral-700 hover:bg-neutral-800 text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-lime-400 text-neutral-950 hover:bg-lime-500">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
