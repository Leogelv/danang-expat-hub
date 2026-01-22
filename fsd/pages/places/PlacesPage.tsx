'use client';

import React, { useMemo, useState } from 'react';
import { MapPin, Star, Wifi } from 'lucide-react';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { AppShell } from '@/fsd/shared/components/AppShell';
import { useRemoteData } from '@/fsd/shared/hooks/useRemoteData';

interface Place {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_level: string | null;
  tags: string[] | null;
  wifi: boolean | null;
  vegan: boolean | null;
  address: string | null;
  contact: string | null;
  rating: number | null;
}

export const PlacesPage: React.FC = () => {
  const { data, isLoading } = useRemoteData<Place>('/api/places');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return data.filter((place) => place.name.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  return (
    <AppShell
      eyebrow="Places"
      title="Local recommendations"
      description="Cafes, coworking, and hidden gems curated by expats."
      variant="lagoon"
      action={<AccentBadge label="Curated" tone="tide" />}
    >
      <GlassCard className="flex items-center gap-3" padding="md">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search places"
          className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/40 focus:outline-none"
        />
      </GlassCard>

      <div className="grid gap-3 lg:grid-cols-2">
        {isLoading && <LoadingCard />}
        {!isLoading && filtered.length === 0 && (
          <EmptyState message="No places yet. Try another keyword or ask the AI assistant." />
        )}
        {filtered.map((place) => (
          <GlassCard key={place.id} className="flex h-full flex-col gap-3" padding="md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{place.name}</h3>
                <p className="text-xs text-white/60">{place.category || 'Spot'}</p>
              </div>
              <AccentBadge label={place.price_level || '$$'} tone="neutral" />
            </div>
            {place.description && <p className="text-sm text-white/70">{place.description}</p>}
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
              {place.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {place.address}
                </span>
              )}
              {place.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {place.rating}
                </span>
              )}
              {place.wifi && (
                <span className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Fast WiFi
                </span>
              )}
            </div>
            {place.tags && place.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {place.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
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
