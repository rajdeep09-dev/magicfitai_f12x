'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, Clock, CalendarDays, FileText, Menu, X } from 'lucide-react';

export default function Header() {
  const { isEditor, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const navItems = [
    { label: 'Dash', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Kanban', href: '/dashboard/kanban', icon: Users },
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
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors ${isActive ? 'text-lime-400' : 'text-neutral-400 hover:text-white'}`}>
                <item.icon className="w-3 h-3" /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <span className={`hidden md:inline-block text-[10px] font-black uppercase px-2 py-1 rounded border ${isEditor ? 'border-purple-500/50 text-purple-400' : 'border-blue-500/50 text-blue-400'}`}>
            {isEditor ? 'EDITOR' : 'CLIENT'}
          </span>
          <button onClick={logout} className="hidden md:block text-[10px] font-bold text-neutral-500 hover:text-red-400 uppercase tracking-widest">Logout</button>
          
          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[#050505] border-b border-white/10 p-4 flex flex-col gap-4 shadow-2xl">
          {navItems.map((item) => {
             const isActive = pathname === item.href;
             return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 p-3 rounded-lg ${isActive ? 'bg-white/5 text-lime-400' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
             );
          })}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
             <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${isEditor ? 'border-purple-500/50 text-purple-400' : 'border-blue-500/50 text-blue-400'}`}>
               {isEditor ? 'EDITOR' : 'CLIENT'}
             </span>
             <button onClick={logout} className="text-xs font-bold text-red-400 uppercase tracking-widest">Logout</button>
          </div>
        </div>
      )}
    </header>
  );
}