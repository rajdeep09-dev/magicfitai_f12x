'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { profile, logout, isEditor } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Creators', href: '/dashboard/creators' },
    { label: 'Analytics', href: '/dashboard/analytics' },
    { label: 'Timeline', href: '/dashboard/timeline' },
    { label: 'Calendar', href: '/dashboard/calendar' },
    { label: 'Reports', href: '/dashboard/reports' },
    ...(isEditor ? [{ label: 'Settings', href: '/dashboard/settings' }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    return pathname === href || (href === '/dashboard' && pathname.startsWith('/dashboard'));
  };

  return (
    <header className="fixed top-6 left-6 right-6 z-50">
      <div className="max-w-[1600px] mx-auto bg-[#050505]/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 h-20 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
import { LogOut, LayoutDashboard, Users, BarChart3, Clock, CalendarDays, FileText } from 'lucide-react';

const navItems = [
    { label: 'Dash', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Creators', href: '/dashboard/creators', icon: Users },
    { label: 'Stats', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Time', href: '/dashboard/timeline', icon: Clock },
    { label: 'Cal', href: '/dashboard/calendar', icon: CalendarDays },
    { label: 'Docs', href: '/dashboard/reports', icon: FileText },
];

// ... (in return)

  return (
    <header className="fixed top-6 left-6 right-6 z-50">
      <div className="max-w-[1600px] mx-auto bg-[#050505]/80 backdrop-blur-3xl border border-white/10 rounded-full px-6 h-16 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <Image src="/logos/f12x-logo.png" alt="F12X" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-black" />
            <Image src="/logos/magicfit-logo.png" alt="Magic" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-black" />
          </div>
          <span className="text-white font-black tracking-tighter text-sm uppercase">F12X <span className="text-lime-400">×</span> MF</span>
        </Link>
        
        <nav className="hidden md:flex gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition ${isActive(item.href) ? 'text-lime-400' : 'text-neutral-500 hover:text-white'}`}>
                <Icon className="w-3.5 h-3.5" />
                {item.label}
                </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className={`w-1.5 h-1.5 rounded-full ${isEditor ? 'bg-purple-400' : 'bg-blue-400'}`}></span>
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
              {isEditor ? 'EDITOR' : 'CLIENT'}
            </span>
          </div>
          <button onClick={handleLogout} className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-red-500 transition">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
      </div>
    </header>
  );
}
