'use client';

import React, { useMemo, useState } from 'react';
import { Filter, MapPin, MessageCircle, Wallet } from 'lucide-react';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { AppShell } from '@/fsd/shared/components/AppShell';
import { useRemoteData } from '@/fsd/shared/hooks/useRemoteData';

interface Listing {
  id: string;
  category: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  location: string | null;
  amenities: string[] | null;
  contact: string | null;
  contact_type: string | null;
}

const filterOptions = ['An Thuong', 'My Khe', 'Son Tra', 'Ngu Hanh Son'];

export const RentalsPage: React.FC = () => {
  const { data: housing, isLoading: housingLoading } = useRemoteData<Listing>('/api/listings?category=housing');
  const { data: bikes, isLoading: bikesLoading } = useRemoteData<Listing>('/api/listings?category=bike');
  const [search, setSearch] = useState('');
  const [activeLocation, setActiveLocation] = useState<string>('All');

  const filteredHousing = useMemo(() => {
    return housing.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesLocation = activeLocation === 'All' || item.location === activeLocation;
      return matchesSearch && matchesLocation;
    });
  }, [housing, search, activeLocation]);

  const filteredBikes = useMemo(() => {
    return bikes.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesLocation = activeLocation === 'All' || item.location === activeLocation;
      return matchesSearch && matchesLocation;
    });
  }, [bikes, search, activeLocation]);

  return (
    <AppShell
      eyebrow="Rentals"
      title="Housing and motorbikes"
      description="Browse long-term apartments, villas, and trusted bike rentals with direct contacts."
      variant="sunset"
      action={<AccentBadge label="Verified" tone="ember" />}
    >
      <GlassCard className="flex flex-col gap-4" padding="lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/80">
            <Filter className="h-4 w-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title"
              className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/40 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', ...filterOptions].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setActiveLocation(option)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  activeLocation === option
                    ? 'border-orange-400/60 bg-orange-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/70'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <SectionBlock
        title="Housing"
        description="Studios, apartments, and villas for 1+ month stays."
        items={filteredHousing}
        loading={housingLoading}
      />

      <SectionBlock
        title="Motorbikes"
        description="Reliable scooters with delivery and helmets included."
        items={filteredBikes}
        loading={bikesLoading}
      />
    </AppShell>
  );
};

const SectionBlock: React.FC<{
  title: string;
  description: string;
  items: Listing[];
  loading: boolean;
}> = ({ title, description, items, loading }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      <AccentBadge label={String(items.length)} tone="neutral" />
    </div>
    <div className="grid gap-3 lg:grid-cols-2">
      {loading && <LoadingCard />}
      {!loading && items.length === 0 && (
        <EmptyState message="No listings yet. Try another filter or ask the AI assistant." />
      )}
      {items.map((item) => (
        <ListingCard key={item.id} item={item} />
      ))}
    </div>
  </div>
);

const ListingCard: React.FC<{ item: Listing }> = ({ item }) => (
  <GlassCard className="flex h-full flex-col gap-3" padding="md">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h4 className="text-base font-semibold text-white">{item.title}</h4>
        <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
          <MapPin className="h-3 w-3" />
          {item.location || 'Danang'}
        </div>
      </div>
      <AccentBadge label={item.category} tone="neutral" />
    </div>
    {item.description && <p className="text-sm text-white/70">{item.description}</p>}
    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
      {item.price && (
        <span className="flex items-center gap-1">
          <Wallet className="h-3 w-3" />
          {item.currency || 'USD'} {item.price}
        </span>
      )}
      {item.contact && (
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {item.contact}
        </span>
      )}
    </div>
    {item.amenities && item.amenities.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {item.amenities.map((amenity) => (
          <span
            key={amenity}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70"
          >
            {amenity}
          </span>
        ))}
      </div>
    )}
  </GlassCard>
);

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
