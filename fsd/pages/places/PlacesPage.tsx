'use client';

import React, { useMemo, useState } from 'react';
import { MapPin, Star, Wifi, X, Leaf } from 'lucide-react';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { ImageCarousel } from '@/fsd/shared/ui/client/media/ImageCarousel';
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
  images: string[] | null;
}

export const PlacesPage: React.FC = () => {
  const { data, isLoading } = useRemoteData<Place>('/api/places');
  const [search, setSearch] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

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
          <PlaceCard key={place.id} place={place} onClick={() => setSelectedPlace(place)} />
        ))}
      </div>

      {/* Detail Sheet */}
      <PlaceDetailSheet
        place={selectedPlace}
        isOpen={!!selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
    </AppShell>
  );
};

const PlaceCard: React.FC<{ place: Place; onClick: () => void }> = ({ place, onClick }) => (
  <GlassCard
    className="flex h-full flex-col gap-3 cursor-pointer hover:border-white/20 transition-colors"
    padding="md"
    onClick={onClick}
  >
    {/* Image */}
    {place.images && place.images.length > 0 && (
      <div onClick={(e) => e.stopPropagation()}>
        <ImageCarousel images={place.images} alt={place.name} aspectRatio="16/9" />
      </div>
    )}

    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold text-white">{place.name}</h3>
        <p className="text-xs text-white/60">{place.category || 'Spot'}</p>
      </div>
      <AccentBadge label={place.price_level || '$$'} tone="neutral" />
    </div>
    {place.description && <p className="text-sm text-white/70 line-clamp-2">{place.description}</p>}
    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 mt-auto">
      {place.address && (
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {place.address}
        </span>
      )}
      {place.rating && (
        <span className="flex items-center gap-1 text-yellow-400">
          <Star className="h-3 w-3 fill-current" />
          {place.rating}
        </span>
      )}
      {place.wifi && (
        <span className="flex items-center gap-1 text-cyan-400">
          <Wifi className="h-3 w-3" />
          WiFi
        </span>
      )}
      {place.vegan && (
        <span className="flex items-center gap-1 text-green-400">
          <Leaf className="h-3 w-3" />
          Vegan
        </span>
      )}
    </div>
    {place.tags && place.tags.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {place.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70"
          >
            {tag}
          </span>
        ))}
        {place.tags.length > 3 && <span className="text-[11px] text-white/40">+{place.tags.length - 3}</span>}
      </div>
    )}
  </GlassCard>
);

// Detail Sheet
const PlaceDetailSheet: React.FC<{
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ place, isOpen, onClose }) => {
  if (!isOpen || !place) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-slate-900 border-t border-white/10 animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 z-10 bg-slate-900 px-6 pt-3 pb-2">
          <div className="mx-auto w-12 h-1 rounded-full bg-white/20" />
          <button onClick={onClose} className="absolute right-4 top-4 p-2 text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-8 space-y-4">
          {place.images && place.images.length > 0 && (
            <ImageCarousel images={place.images} alt={place.name} aspectRatio="16/9" />
          )}

          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-white">{place.name}</h2>
              <AccentBadge label={place.price_level || '$$'} tone="neutral" />
            </div>
            <p className="text-sm text-white/60 mt-1">{place.category || 'Spot'}</p>
          </div>

          {/* Rating & Features */}
          <div className="flex flex-wrap gap-3">
            {place.rating && (
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-semibold">{place.rating}</span>
              </div>
            )}
            {place.wifi && (
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Wifi className="h-5 w-5" />
                <span>Fast WiFi</span>
              </div>
            )}
            {place.vegan && (
              <div className="flex items-center gap-1.5 text-green-400">
                <Leaf className="h-5 w-5" />
                <span>Vegan options</span>
              </div>
            )}
          </div>

          {place.address && (
            <div className="flex items-center gap-2 text-white/70">
              <MapPin className="h-4 w-4" />
              {place.address}
            </div>
          )}

          {place.description && <p className="text-white/80 leading-relaxed">{place.description}</p>}

          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {place.contact && (
            <a
              href={`https://t.me/${place.contact.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 rounded-xl bg-teal-500 text-white text-center font-semibold hover:bg-teal-400 transition-colors"
            >
              Contact: {place.contact}
            </a>
          )}
        </div>
      </div>
    </>
  );
};

const LoadingCard = () => (
  <GlassCard className="h-48 animate-pulse bg-white/5" padding="md">
    <div className="h-24 w-full rounded-xl bg-white/10 mb-3" />
    <div className="h-4 w-1/2 rounded bg-white/10" />
  </GlassCard>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <GlassCard className="border-dashed border-white/15" padding="lg">
    <p className="text-sm text-white/60">{message}</p>
  </GlassCard>
);
