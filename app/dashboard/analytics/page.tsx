'use client';
export const dynamic = "force-dynamic";

import dynamicImport from 'next/dynamic';

const DynamicAnalyticsContent = dynamicImport(() => import('@/components/AnalyticsContent'), { ssr: false });

export default function AnalyticsPage() {
  return <DynamicAnalyticsContent />;
}
