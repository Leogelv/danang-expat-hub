'use client';

import React, { useMemo, useState } from 'react';
import { Handshake, Search, Tag } from 'lucide-react';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { AppShell } from '@/fsd/shared/components/AppShell';
import { useRemoteData } from '@/fsd/shared/hooks/useRemoteData';

interface MarketItem {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
  condition: string | null;
  contact: string | null;
}

export const MarketPage: React.FC = () => {
  const { data, isLoading } = useRemoteData<MarketItem>('/api/market');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return data.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  return (
    <AppShell
      eyebrow="Marketplace"
      title="Buy and sell with expats"
      description="Quick listings for furniture, electronics, bikes, and essentials."
      variant="midnight"
      action={<AccentBadge label="Live" tone="aurora" />}
    >
      <GlassCard className="flex items-center gap-3" padding="md">
        <Search className="h-4 w-4 text-white/60" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search items"
          className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/40 focus:outline-none"
        />
      </GlassCard>

      <div className="grid gap-3 lg:grid-cols-2">
        {isLoading && <LoadingCard />}
        {!isLoading && filtered.length === 0 && (
          <EmptyState message="No market items yet. Try another keyword or ask the AI assistant." />
        )}
        {filtered.map((item) => (
          <GlassCard key={item.id} className="flex h-full flex-col gap-3" padding="md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                {item.category && (
                  <p className="text-xs text-white/60">{item.category}</p>
                )}
              </div>
              <AccentBadge label={item.condition || 'Used'} tone="neutral" />
            </div>
            {item.description && <p className="text-sm text-white/70">{item.description}</p>}
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
              {item.price && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {item.currency || 'USD'} {item.price}
                </span>
              )}
              {item.contact && (
                <span className="flex items-center gap-1">
                  <Handshake className="h-3 w-3" />
                  {item.contact}
                </span>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </AppShell>
  );
};

const LoadingCard = () => (
  <GlassCard className="h-32 animate-pulse bg-white/5" padding="md">
    <div className="h-4 w-1/2 rounded bg-white/10" />
  </GlassCard>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <GlassCard className="border-dashed border-white/15" padding="lg">
    <p className="text-sm text-white/60">{message}</p>
  </GlassCard>
);
