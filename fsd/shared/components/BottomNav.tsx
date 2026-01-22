'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Building2,
  CalendarDays,
  Coffee,
  Home,
  MessageCircle,
  ShoppingBag,
  Users,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/chat', label: 'AI', icon: MessageCircle },
  { href: '/rentals', label: 'Rentals', icon: Building2 },
  { href: '/market', label: 'Market', icon: ShoppingBag },
  { href: '/places', label: 'Places', icon: Coffee },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/notifications', label: 'Alerts', icon: Bell },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 z-20 w-[92%] max-w-[720px] -translate-x-1/2">
      <div className="rounded-[24px] border border-white/15 bg-slate-950/70 px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'group flex min-w-[72px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition-colors',
                  isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white',
                )}
              >
                <span
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-transform group-hover:-translate-y-0.5',
                    isActive && 'border-orange-400/50 bg-orange-500/20',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
