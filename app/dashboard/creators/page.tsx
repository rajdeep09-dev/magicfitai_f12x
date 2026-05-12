'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Award, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CreatorCard from '@/components/CreatorCard';
import CreatorFilterBar from '@/components/CreatorFilterBar';
import KPICard from '@/components/KPICard';
import { getCreators } from '@/lib/supabase/creators';
import { createClient } from '@/lib/supabase/client';
import { Creator } from '@/types/creator';
import CreatorModal from '@/components/CreatorModal';

const CREATORS_PER_PAGE = 10;

export default function CreatorsPage() {
  const { isEditor, isClient } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);
  const [payoutFilter, setPayoutFilter] = useState('');
  const [sortBy, setSortBy] = useState('engagement');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<Set<string>>(new Set());
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const toggleCreatorSelection = (id: string) => {
    const newSelection = new Set(selectedCreatorIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedCreatorIds(newSelection);
  };

  // Calculate Invoice
  const selectedCreatorsData = useMemo(() => {
    return creators.filter(c => selectedCreatorIds.has(c.id));
  }, [creators, selectedCreatorIds]);

  const invoiceTotals = useMemo(() => {
    const baseTotal = selectedCreatorsData.reduce((sum, c) => sum + (c.base_price || 0), 0);
    const commission = baseTotal * 0.20;
    const tax = (baseTotal + commission) * 0.05;
    return { baseTotal, commission, tax, total: baseTotal + commission + tax };
  }, [selectedCreatorsData]);

  // ... (inside the return statement, add the Checkout Bar)
  {selectedCreatorIds.size > 0 && (
    <div className="fixed bottom-6 left-6 right-6 bg-neutral-900 border border-lime-500/30 p-4 rounded-2xl shadow-2xl flex items-center justify-between z-50">
      <div>
        <p className="text-white font-bold">{selectedCreatorIds.size} Creators Selected</p>
        <p className="text-xs text-neutral-400">Total: ${invoiceTotals.total.toFixed(2)}</p>
      </div>
      <button 
        onClick={() => setIsInvoiceModalOpen(true)}
        className="bg-lime-400 text-black font-bold px-6 py-3 rounded-xl hover:bg-lime-300"
      >
        Onboard Creators
      </button>
    </div>
  )}

  const loadCreators = async () => {
    setLoading(true);
    try {
      const data = await getCreators({ forceRefresh: true });
      setCreators(data);
    } catch (error) {
      console.error('Failed to load creators', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreators();
  }, []);

  const handleOpenModal = (creator: Creator | null = null) => {
    setSelectedCreator(creator);
    setIsModalOpen(true);
  };

  const handleSaveCreator = async (creatorData: Partial<Creator>) => {
    try {
      if (selectedCreator) {
        // Update existing
        await supabase.from('creators').update(creatorData).eq('id', selectedCreator.id);
      } else {
        // Create new
        // We need a dummy campaign_id for now if it's required by the DB
        // Fetch the first campaign or create one if none exists in a real scenario
        // Assuming your DB allows null or has a default, else we mock it
        const { data: campaigns } = await supabase.from('campaigns').select('id').limit(1);
        const campaign_id = campaigns && campaigns.length > 0 ? campaigns[0].id : null;
        
        await supabase.from('creators').insert({ ...creatorData, campaign_id });
      }
      await loadCreators(); // Refresh the list
    } catch (error) {
      console.error('Error saving creator', error);
    }
  };

  // Filter and sort logic
  const filteredCreators = useMemo(() => {
    let filtered = [...creators];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((c) =>
        c.creator_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Platform filter
    if (platformFilter) {
      filtered = filtered.filter((c) => c.platform === platformFilter);
    }

    // Active campaign filter
    if (activeOnlyFilter) {
      filtered = filtered.filter((c) => c.approval_status !== 'Published' && c.approval_status !== 'Script Sent');
    }

    // Payout filter
    if (payoutFilter) {
      filtered = filtered.filter((c) => c.payment_status === payoutFilter);
    }

    // Sorting
    if (sortBy === 'engagement') {
      filtered.sort((a, b) => b.engagement_rate - a.engagement_rate);
    } else if (sortBy === 'followers') {
      filtered.sort((a, b) => (b.followers || 0) - (a.followers || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.creator_name.localeCompare(b.creator_name));
    }

    return filtered;
  }, [creators, searchQuery, platformFilter, activeOnlyFilter, payoutFilter, sortBy]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalApproved = creators.filter((c) => c.approval_status === 'Approved' || c.approval_status === 'Published').length;
    const activeOnCampaign = creators.filter((c) => c.approval_status !== 'Published' && c.approval_status !== 'Script Sent').length;
    const avgEngagement = creators.length > 0
      ? (creators.reduce((sum, c) => sum + (c.engagement_rate || 0), 0) / creators.length).toFixed(1)
      : '0';
    const totalFollowers = creators.reduce((sum, c) => sum + (c.followers || 0), 0);

    return { totalApproved, activeOnCampaign, avgEngagement, totalFollowers };
  }, [creators]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCreators.length / CREATORS_PER_PAGE);
  const startIdx = (currentPage - 1) * CREATORS_PER_PAGE;
  const paginatedCreators = useMemo(
    () => filteredCreators.slice(startIdx, startIdx + CREATORS_PER_PAGE),
    [filteredCreators, currentPage]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-neutral-950 px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Hero Section */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-50 mb-2">Creator Network</h1>
            <p className="text-neutral-400">Manage and monitor all approved creators and their campaign performance</p>
          </div>
          {isEditor && (
            <button
              onClick={() => handleOpenModal(null)}
              className="bg-lime-400 text-neutral-950 px-4 py-2 rounded-lg font-semibold hover:bg-lime-500 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Creator
            </button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <KPICard
            icon={Award}
            label="Approved Creators"
            value={kpis.totalApproved}
            delay={0.1}
          />
          <KPICard
            icon={TrendingUp}
            label="Active on Campaign"
            value={kpis.activeOnCampaign}
            delay={0.2}
          />
          <KPICard
            icon={Users}
            label="Avg. Engagement Rate"
            value={`${kpis.avgEngagement}%`}
            delay={0.3}
          />
          <KPICard
            icon={DollarSign}
            label="Total Followers"
            value={`${(kpis.totalFollowers / 1000).toFixed(0)}K`}
            delay={0.4}
          />
        </div>
      </motion.section>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CreatorFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          platformFilter={platformFilter}
          onPlatformChange={setPlatformFilter}
          activeOnlyFilter={activeOnlyFilter}
          onActiveOnlyChange={setActiveOnlyFilter}
          payoutFilter={payoutFilter}
          onPayoutChange={setPayoutFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </motion.div>

      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-6"
      >
        <p className="text-sm text-neutral-400">
          Showing <span className="text-lime-400 font-semibold">{filteredCreators.length}</span> of{' '}
          <span className="text-neutral-300">{creators.length}</span> creators
        </p>
      </motion.div>

      {/* Creators Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
        </div>
      ) : filteredCreators.length > 0 ? (
        <ErrorBoundary>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {paginatedCreators.map((creator, idx) => (
              <div key={creator.id} onClick={() => handleOpenModal(creator)} className="cursor-pointer">
                <CreatorCard
                  id={creator.id}
                  name={creator.creator_name || 'Unnamed Creator'}
                  platform={creator.platform || 'Instagram'}
                  followers={creator.followers || 0}
                  engagementRatio={creator.engagement_rate || 0}
                  payoutStatus={creator.payment_status || 'pending'}
                  activeOnCampaign={creator.approval_status !== 'Published' && creator.approval_status !== 'Script Sent'}
                  campaignName={creator.campaign_id ? 'Active Campaign' : undefined}
                  index={idx}
                />
              </div>
            ))}
          </motion.div>
        </ErrorBoundary>
      ) : (
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center justify-center gap-2 mt-12"
            >
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-400 hover:border-lime-400 hover:text-lime-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition ${
                    currentPage === page
                      ? 'bg-lime-400 text-neutral-950 font-semibold'
                      : 'border border-neutral-700 text-neutral-400 hover:border-lime-400 hover:text-lime-400'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-400 hover:border-lime-400 hover:text-lime-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-12 text-center"
        >
          <Users className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 mb-2">No creators found matching your filters</p>
          <p className="text-sm text-neutral-500">Try adjusting your search criteria</p>
        </motion.div>
      )}

      <CreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCreator}
        creator={selectedCreator}
      />
    </motion.div>
  );
}
