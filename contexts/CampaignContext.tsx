import React, { createContext, useContext, useState, useMemo } from 'react';
import { Creator } from '@/types/creator';

interface CampaignContextType {
  budget: number;
  remainingBudget: number;
  creators: Creator[];
  setCreators: (c: Creator[]) => void;
  approveCreator: (creatorId: string) => void;
  selectedCreators: Set<string>;
  toggleSelect: (id: string) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider = ({ children }: { children: React.ReactNode }) => {
  const [budget] = useState(5000);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<Set<string>>(new Set());

  const remainingBudget = useMemo(() => {
    const spent = creators
      .filter(c => c.approval_status === 'Approved')
      .reduce((sum, c) => sum + (c.base_price || 0), 0);
    return budget - spent;
  }, [creators, budget]);

  const approveCreator = (creatorId: string) => {
    // Logic to move to approved in Supabase
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedCreators);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCreators(next);
  };

  return (
    <CampaignContext.Provider value={{ budget, remainingBudget, creators, setCreators, approveCreator, selectedCreators, toggleSelect }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (!context) throw new Error('useCampaign must be used within CampaignProvider');
  return context;
};
