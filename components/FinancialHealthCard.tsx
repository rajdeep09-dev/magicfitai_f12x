import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, DollarSign } from 'lucide-react';

export default function FinancialHealthCard({ baseTotal, commission, tax }: { baseTotal: number, commission: number, tax: number }) {
  const [showProfit, setShowProfit] = useState(false);
  const total = baseTotal + commission + tax;

  return (
    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Financial Health</h3>
        <button onClick={() => setShowProfit(!showProfit)} className="text-neutral-500 hover:text-white">
          {showProfit ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-400">Creator Payouts</span>
            <span className="text-lg font-bold text-white">${baseTotal.toFixed(2)}</span>
        </div>
        
        {showProfit && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-xs text-lime-400">
                    <span>Agency Margin (25%)</span>
                    <span>+${(commission + tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-lime-400">
                    <span>Total Client Invoice</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </motion.div>
        )}
      </div>
    </div>
  );
}