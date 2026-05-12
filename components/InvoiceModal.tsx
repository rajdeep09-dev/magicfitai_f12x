import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  creators: any[];
  totals: { baseTotal: number, commission: number, tax: number, total: number };
}

export default function InvoiceModal({ isOpen, onClose, creators, totals }: InvoiceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-neutral-950 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Campaign Onboarding Summary</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {creators.map(c => (
            <div key={c.id} className="flex justify-between text-sm">
              <span>{c.creator_name}</span>
              <span>${(c.base_price || 0).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between"><span>Base Total</span><span>${totals.baseTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>F12X Commission (20%)</span><span>${totals.commission.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax (5%)</span><span>${totals.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 text-lime-400">
              <span>Total Invoice</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <Button className="w-full bg-lime-400 text-black font-bold mt-4">
          Confirm & Onboard
        </Button>
      </DialogContent>
    </Dialog>
  );
}