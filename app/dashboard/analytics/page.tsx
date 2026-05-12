'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

// Generate chart data from mock creators
const engagementTrendData = [
  { date: 'May 1', engagement: 3.2, views: 12000 },
  { date: 'May 5', engagement: 4.1, views: 24500 },
  { date: 'May 10', engagement: 5.8, views: 38000 },
  { date: 'May 15', engagement: 7.2, views: 125000 },
  { date: 'May 20', engagement: 6.9, views: 89000 },
  { date: 'May 25', engagement: 8.5, views: 156000 },
];

const creatorPerformanceData = mockCreators
  .filter((c) => c.views > 0)
  .map((c) => ({
    name: c.creator_name.replace('@', ''),
    views: c.views,
    engagement: c.engagement_rate,
  }));

const platformBreakdownData = [
  {
    name: 'Instagram',
    value: mockCreators.filter((c) => c.platform === 'Instagram').reduce((sum, c) => sum + c.views, 0),
  },
  {
    name: 'TikTok',
    value: mockCreators.filter((c) => c.platform === 'TikTok').reduce((sum, c) => sum + c.views, 0),
  },
  {
    name: 'YouTube',
    value: mockCreators.filter((c) => c.platform === 'YouTube').reduce((sum, c) => sum + c.views, 0),
  },
];

const COLORS = ['#AEE078', '#84cc16', '#65a30d'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900/95 border border-neutral-700 rounded-lg p-3">
        <p className="text-neutral-50 text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const totalViews = mockCreators.reduce((sum, c) => sum + c.views, 0);
  const avgEngagement = (
    mockCreators.reduce((sum, c) => sum + c.engagement_rate, 0) / mockCreators.length
  ).toFixed(1);
  const totalSpend = mockCreators.reduce((sum, c) => sum + c.spend, 0);
  const costPerView = (totalSpend / totalViews).toFixed(2);

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
          <h1 className="text-3xl font-bold text-neutral-50 mb-2">Performance Analytics</h1>
          <p className="text-neutral-400">
            Detailed performance metrics and trend analysis for your campaign creators.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Views', value: totalViews.toLocaleString(), color: 'bg-blue-900/20 border-blue-700' },
            { label: 'Avg Engagement', value: `${avgEngagement}%`, color: 'bg-pink-900/20 border-pink-700' },
            { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}`, color: 'bg-purple-900/20 border-purple-700' },
            { label: 'Cost per View', value: `$${costPerView}`, color: 'bg-orange-900/20 border-orange-700' },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-neutral-900/50 border rounded-lg p-4 ${metric.color}`}
            >
              <p className="text-xs text-neutral-400 font-medium mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-neutral-50">{metric.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Engagement & Views Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-50 mb-4">Campaign Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={engagementTrendData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis dataKey="date" stroke="#737373" />
              <YAxis stroke="#737373" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="views" fill="#AEE078" name="Views" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#ff69b4"
                name="Engagement %"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Creator Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold text-neutral-50 mb-4">Creator Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={creatorPerformanceData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="name" stroke="#737373" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#737373" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" fill="#AEE078" name="Views" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Platform Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold text-neutral-50 mb-4">Reach by Platform</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${(value / totalViews * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
