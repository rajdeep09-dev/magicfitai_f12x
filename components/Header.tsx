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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Image 
              src="/logos/f12x-logo.png" 
              alt="F12X Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-lime-400 font-bold text-lg">×</span>
            <Image 
              src="/logos/magicfit-logo.png" 
              alt="Magicfit Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
          <span className="text-white font-black tracking-tighter text-xl uppercase">
            F12X <span className="text-lime-400">×</span> MAGICFIT
          </span>
        </Link>        <nav className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`text-xs font-bold uppercase tracking-widest transition ${isActive(item.href) ? 'text-lime-400' : 'text-neutral-500 hover:text-white'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${isEditor ? 'bg-purple-400' : 'bg-blue-400'}`}></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
              {isEditor ? 'Editor Mode' : 'Client Mode'}
            </span>
          </div>
          <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-red-500 transition">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
