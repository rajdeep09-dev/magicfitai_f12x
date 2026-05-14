'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, Clock, CalendarDays, FileText } from 'lucide-react';

export default function Header() {
  const { isEditor, logout } = useAuth();
  
  const navItems = [
    { label: 'Dash', href: '/dashboard', icon: LayoutDashboard },
    ...(isEditor ? [{ label: 'Kanban', href: '/dashboard/kanban', icon: Users }] : []),
    { label: 'Creators', href: '/dashboard/creators', icon: Users },
    { label: 'Time', href: '/dashboard/timeline', icon: Clock },
    { label: 'Cal', href: '/dashboard/calendar', icon: CalendarDays },
    { label: 'Docs', href: '/dashboard/reports', icon: FileText },
    ...(isEditor ? [{ label: 'Settings', href: '/dashboard/settings', icon: FileText }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <Image src="/logos/f12x-logo.png" alt="F" width={28} height={28} className="w-7 h-7 rounded-full border border-white/20" />
            <Image src="/logos/magicfit-logo.png" alt="M" width={28} height={28} className="w-7 h-7 rounded-full border border-white/20" />
          </div>
          <span className="text-white font-bold tracking-tight text-sm uppercase">F12X × MAGICFIT</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-widest flex items-center gap-1.5">
              <item.icon className="w-3 h-3" /> {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${isEditor ? 'border-purple-500/50 text-purple-400' : 'border-blue-500/50 text-blue-400'}`}>
            {isEditor ? 'EDITOR' : 'CLIENT'}
          </span>
          <button onClick={logout} className="text-[10px] font-bold text-neutral-500 hover:text-red-400 uppercase tracking-widest">Logout</button>
        </div>
      </div>
    </header>
  );
}