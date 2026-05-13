'use client';

import { useAuth } from '@/hooks/useAuth';
import EditorDashboard from './EditorDashboard';
import ClientDashboard from './ClientDashboard';

export default function DashboardShell() {
  const { isEditor, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-lime-400 font-black">SYNCING...</div>;

  return isEditor ? <EditorDashboard /> : <ClientDashboard />;
}
