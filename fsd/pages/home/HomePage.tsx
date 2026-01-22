'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bot, CalendarDays, Coffee, Home, ShoppingBag, Users } from 'lucide-react';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { AppShell } from '@/fsd/shared/components/AppShell';

interface StatsPayload {
  listings: number;
  market: number;
  places: number;
  events: number;
  posts: number;
}

const quickLinks = [
  {
    href: '/chat',
    title: 'AI Assistant',
    description: 'Ask in English or Russian. Get housing, bikes, and events in one chat.',
    icon: Bot,
    badge: 'Core',
  },
  {
    href: '/rentals',
    title: 'Rentals',
    description: 'Long-term apartments, villas, and motorbikes with direct contacts.',
    icon: Home,
    badge: 'Housing',
  },
  {
    href: '/market',
    title: 'Market',
    description: 'Buy or sell essentials when relocating or upgrading your setup.',
    icon: ShoppingBag,
    badge: 'Deals',
  },
  {
    href: '/places',
    title: 'Places',
    description: 'Cafes, coworking, and local favorites curated by expats.',
    icon: Coffee,
    badge: 'Guide',
  },
  {
    href: '/events',
    title: 'Events',
    description: 'Meetups, sports, and social gatherings happening this week.',
    icon: CalendarDays,
    badge: 'Social',
  },
  {
    href: '/community',
    title: 'Community',
    description: 'Threads, tips, and direct asks from expats in Danang.',
    icon: Users,
    badge: 'Network',
  },
];

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<StatsPayload | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/stats')
      .then((res) => res.json())
      .then((payload) => {
        if (!active) return;
        if (!payload?.error) {
          setStats(payload);
        }
      })
      .catch(() => {
        if (!active) return;
        setStats(null);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell
      eyebrow="Danang Expat Hub"
      title="Everything you need in one mini app"
      description="AI-first hub for long-term stays, local knowledge, and community support."
      variant="ember"
      action={<AccentBadge label="Beta" tone="ember" />}
    >
      <GlassCard className="flex flex-col gap-4" padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Start with the AI assistant</h3>
            <p className="mt-2 text-sm text-white/70">
              Ask about housing, bike rentals, cafes, coworking, or events. The assistant searches the live database and
              gives action-ready answers.
            </p>
          </div>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-5 py-2.5 text-sm text-white shadow-[0_18px_45px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            Launch AI
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard label="Listings" value={stats?.listings ?? 0} />
          <StatCard label="Market items" value={stats?.market ?? 0} />
          <StatCard label="Places" value={stats?.places ?? 0} />
          <StatCard label="Events" value={stats?.events ?? 0} />
          <StatCard label="Community posts" value={stats?.posts ?? 0} />
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="group">
              <GlassCard className="flex h-full flex-col justify-between gap-4 transition-transform duration-200 group-hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{link.title}</h3>
                      <p className="text-xs text-white/60">{link.badge}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <p className="text-sm text-white/70">{link.description}</p>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
};

const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <span className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</span>
    <span className="text-lg font-semibold text-white">{value}</span>
  </div>
);
