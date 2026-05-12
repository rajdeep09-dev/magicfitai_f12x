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
    { label: 'Messages', href: '/dashboard/messages' },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/50 backdrop-blur-md border-b border-neutral-800">
      <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 flex-shrink-0">
          <Image 
            src="/logos/magicfit-logo.png" 
            alt="Magicfit Logo"
            width={40}
            height={40}
            className="w-10 h-10"
            priority
          />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-neutral-50">
              F12X Studio <span className="text-lime-400">x Magicfit</span>
            </h1>
            <p className="text-xs text-neutral-400">Client Portal</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive(item.href)
                  ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
                  : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Live Sync Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-lime-400 rounded-full animate-pulse" />
            <span className="text-xs text-lime-400 font-semibold hidden sm:inline">Live Sync</span>
          </div>

          {/* User Role Badge */}
          <div className="hidden sm:block px-3 py-1.5 rounded-full bg-neutral-800/50 border border-neutral-700">
            <span className="text-xs font-semibold text-neutral-300">
              {isEditor ? '👨‍💼 Editor' : '👤 Client'}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-neutral-400" />
            ) : (
              <Menu className="w-5 h-5 text-neutral-400" />
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50 transition text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-4 space-y-2 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive(item.href)
                  ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
                  : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50'
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
