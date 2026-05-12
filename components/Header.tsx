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
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/70 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-lime-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <Image 
              src="/logos/magicfit-logo.png" 
              alt="Magicfit Logo"
              width={40}
              height={40}
              className="w-10 h-10 relative z-10 drop-shadow-md"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-neutral-50 tracking-tight">
              F12X Studio <span className="text-lime-400 drop-shadow-[0_0_8px_rgba(132,204,22,0.4)]">x Magicfit</span>
            </h1>
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Client Portal</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive(item.href)
                  ? 'bg-lime-400/10 text-lime-400 shadow-[inset_0_0_12px_rgba(132,204,22,0.2)] border border-lime-400/20'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          {/* Live Sync Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-white/5">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(132,204,22,0.8)]" />
            <span className="text-xs text-lime-400 font-bold uppercase tracking-wider hidden sm:inline">Live Sync</span>
          </div>

          {/* User Role Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-white/5 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neutral-700 to-neutral-600 flex items-center justify-center text-[10px]">
              {isEditor ? 'E' : 'C'}
            </div>
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wide">
              {isEditor ? 'Editor' : 'Client'}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-full transition"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-neutral-300" />
            ) : (
              <Menu className="w-5 h-5 text-neutral-300" />
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 text-sm font-medium border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-4 space-y-2 bg-neutral-950/95 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive(item.href)
                  ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
