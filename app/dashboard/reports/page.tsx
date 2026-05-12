'use client';

import { motion } from 'framer-motion';
import { Download, FileText, BarChart3 } from 'lucide-react';
import { useState } from 'react';

const generateCSVReport = () => {
  const headers = [
    'Creator Name',
    'Platform',
    'Deliverable',
    'Status',
    'Progress %',
    'Views',
    'Engagement %',
    'Spend',
    'Live Date',
  ];

  const rows = mockCreators.map((creator) => [
    creator.creator_name,
    creator.platform,
    creator.deliverable,
    creator.approval_status,
    creator.progress_score,
    creator.views,
    creator.engagement_rate,
    creator.spend,
    creator.live_date,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `magicfit-campaign-report-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

const generateTextReport = () => {
  const totalCreators = mockCreators.length;
  const publishedCount = mockCreators.filter((c) => c.approval_status === 'Published').length;
  const pendingCount = mockCreators.filter((c) => c.approval_status === 'Video Pending Approval').length;
  const totalViews = mockCreators.reduce((sum, c) => sum + c.views, 0);
  const totalSpend = mockCreators.reduce((sum, c) => sum + c.spend, 0);
  const avgEngagement = (mockCreators.reduce((sum, c) => sum + c.engagement_rate, 0) / mockCreators.length).toFixed(1);

  const reportContent = `MAGICFIT CAMPAIGN REPORT
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
================
Total Creators: ${totalCreators}
Published Content: ${publishedCount}
Pending Approval: ${pendingCount}
Total Views: ${totalViews.toLocaleString()}
Total Spend: $${totalSpend.toLocaleString()}
Average Engagement: ${avgEngagement}%

CREATOR PERFORMANCE
===================
${mockCreators
  .map(
    (c) =>
      `${c.creator_name} (${c.platform})
  Status: ${c.approval_status}
  Progress: ${c.progress_score}%
  Views: ${c.views}
  Engagement: ${c.engagement_rate}%
  Spend: $${c.spend}`
  )
  .join('\n\n')}

END OF REPORT`;

  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `magicfit-campaign-report-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default function ReportsPage() {
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const totalCreators = mockCreators.length;
  const publishedCount = mockCreators.filter((c) => c.approval_status === 'Published').length;
  const totalViews = mockCreators.reduce((sum, c) => sum + c.views, 0);
  const totalSpend = mockCreators.reduce((sum, c) => sum + c.spend, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-50 mb-2">Reports & Exports</h1>
          <p className="text-neutral-400">
            Generate and download campaign reports and performance analytics.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Creators', value: totalCreators },
            { label: 'Published', value: publishedCount },
            { label: 'Total Views', value: totalViews.toLocaleString() },
            { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}` },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4"
            >
              <p className="text-xs text-neutral-400 font-medium mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-neutral-50">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Export Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-50 mb-6">Download Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSV Export */}
            <div className="border border-neutral-700 rounded-lg p-6 hover:bg-neutral-800/30 transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-900/30 border border-blue-700 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-50 mb-2">CSV Export</h3>
                  <p className="text-sm text-neutral-400 mb-4">
                    Download all creator data and metrics as a CSV file for spreadsheet analysis.
                  </p>
                  <button
                    onClick={() => {
                      setDownloadingCSV(true);
                      setTimeout(() => {
                        generateCSVReport();
                        setDownloadingCSV(false);
                      }, 500);
                    }}
                    disabled={downloadingCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {downloadingCSV ? 'Preparing...' : 'Download CSV'}
                  </button>
                </div>
              </div>
            </div>

            {/* Campaign Summary */}
            <div className="border border-neutral-700 rounded-lg p-6 hover:bg-neutral-800/30 transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-900/30 border border-red-700 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-50 mb-2">Campaign Summary</h3>
                  <p className="text-sm text-neutral-400 mb-4">
                    Download a comprehensive campaign summary with KPIs and creator performance.
                  </p>
                  <button
                    onClick={() => {
                      setDownloadingReport(true);
                      setTimeout(() => {
                        generateTextReport();
                        setDownloadingReport(false);
                      }, 500);
                    }}
                    disabled={downloadingReport}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {downloadingReport ? 'Preparing...' : 'Download Report'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommended Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-50 mb-4">Recommended Reports</h2>
          <div className="space-y-3">
            {[
              {
                title: 'Weekly Performance Summary',
                description: 'View top performers and key metrics from this week',
              },
              {
                title: 'Creator ROI Analysis',
                description: 'Cost-per-view and engagement metrics by creator',
              },
              {
                title: 'Platform Breakdown',
                description: 'Performance comparison across Instagram, TikTok, and YouTube',
              },
              {
                title: 'Approval Timeline',
                description: 'Track content approval rates and timeline adherence',
              },
            ].map((report, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border border-neutral-700 hover:bg-neutral-800/30 transition cursor-pointer"
              >
                <div>
                  <p className="font-medium text-neutral-50">{report.title}</p>
                  <p className="text-sm text-neutral-400">{report.description}</p>
                </div>
                <Download className="w-5 h-5 text-lime-400 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
