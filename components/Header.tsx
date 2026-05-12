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
          <span className="text-white font-black tracking-tighter text-xl uppercase hidden sm:block">
            F12X <span className="text-lime-400">×</span> MAGICFIT
          </span>
        </Link>
        
        <nav className="hidden md:flex gap-8">
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
