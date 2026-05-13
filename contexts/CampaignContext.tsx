'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Creator {
  id: string;
  handle: string;
  platform?: string;
  base_price?: number;
  followers?: number;
  content_type?: string;
  approval_status?: string;
  notes?: string;
  avatar_url?: string;
}

interface CampaignContextType {
  budget: number;
  remainingBudget: number;
  creators: Creator[];
  loadingCreators: boolean;
  setCreators: (c: Creator[]) => void;
  loadCreators: () => Promise<void>;
  approveCreator: (creatorId: string) => void;
  selectedCreators: Set<string>;
  toggleSelect: (id: string) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider = ({ children }: { children: React.ReactNode }) => {
  const [budget] = useState(5000);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<Set<string>>(new Set());
  const [loadingCreators, setLoadingCreators] = useState(true);

  const loadCreators = async () => {
    try {
      setLoadingCreators(true);
      const supabase = createClient();
      const { data, error } = await supabase.from('creators').select('*');
      if (!error && data) {
        setCreators(data);
      } else if (error) {
        console.error('Error fetching creators:', error);
      }
    } catch (err) {
      console.error('Unexpected error loading creators:', err);
    } finally {
      setLoadingCreators(false);
    }
  };

  useEffect(() => {
    loadCreators();
  }, []);

  const remainingBudget = useMemo(() => {
    const spent = creators
      .filter(c => c.approval_status === 'Approved')
      .reduce((sum, c) => sum + (c.base_price || 0), 0);
    return budget - spent;
  }, [creators, budget]);

  const approveCreator = async (creatorId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('creators').update({ approval_status: 'Approved' }).eq('id', creatorId);
      if (!error) {
         loadCreators();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedCreators);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCreators(next);
  };

  return (
    <CampaignContext.Provider value={{ budget, remainingBudget, creators, loadingCreators, setCreators, loadCreators, approveCreator, selectedCreators, toggleSelect }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (!context) throw new Error('useCampaign must be used within CampaignProvider');
  return context;
};
