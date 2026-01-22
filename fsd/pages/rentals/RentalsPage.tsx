'use client';

import React, { useMemo, useState } from 'react';
import { Filter, MapPin, MessageCircle, Wallet, X } from 'lucide-react';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { ImageCarousel } from '@/fsd/shared/ui/client/media/ImageCarousel';
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
  images: string[] | null;
}

const filterOptions = ['An Thuong', 'My Khe', 'Son Tra', 'Ngu Hanh Son'];

export const RentalsPage: React.FC = () => {
  const { data: housing, isLoading: housingLoading } = useRemoteData<Listing>('/api/listings?category=housing');
  const { data: bikes, isLoading: bikesLoading } = useRemoteData<Listing>('/api/listings?category=bike');
  const [search, setSearch] = useState('');
  const [activeLocation, setActiveLocation] = useState<string>('All');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

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
        onItemClick={setSelectedListing}
      />

      <SectionBlock
        title="Motorbikes"
        description="Reliable scooters with delivery and helmets included."
        items={filteredBikes}
        loading={bikesLoading}
        onItemClick={setSelectedListing}
      />

      {/* Detail Sheet */}
      <ListingDetailSheet
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
      />
    </AppShell>
  );
};

const SectionBlock: React.FC<{
  title: string;
  description: string;
  items: Listing[];
  loading: boolean;
  onItemClick: (item: Listing) => void;
}> = ({ title, description, items, loading, onItemClick }) => (
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
        <ListingCard key={item.id} item={item} onClick={() => onItemClick(item)} />
      ))}
    </div>
  </div>
);

const ListingCard: React.FC<{ item: Listing; onClick: () => void }> = ({ item, onClick }) => (
  <GlassCard
    className="flex h-full flex-col gap-3 cursor-pointer hover:border-white/20 transition-colors"
    padding="md"
    onClick={onClick}
  >
    {/* Image Carousel */}
    {item.images && item.images.length > 0 && (
      <div onClick={(e) => e.stopPropagation()}>
        <ImageCarousel images={item.images} alt={item.title} aspectRatio="16/9" />
      </div>
    )}

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
    {item.description && <p className="text-sm text-white/70 line-clamp-2">{item.description}</p>}
    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 mt-auto">
      {item.price && (
        <span className="flex items-center gap-1 text-orange-400 font-semibold">
          <Wallet className="h-3 w-3" />
          {item.currency || 'USD'} {item.price}/mo
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
        {item.amenities.slice(0, 4).map((amenity) => (
          <span
            key={amenity}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70"
          >
            {amenity}
          </span>
        ))}
        {item.amenities.length > 4 && (
          <span className="text-[11px] text-white/40">+{item.amenities.length - 4}</span>
        )}
      </div>
    )}
  </GlassCard>
);

// Detail Sheet для просмотра листинга
const ListingDetailSheet: React.FC<{
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ listing, isOpen, onClose }) => {
  if (!isOpen || !listing) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-slate-900 border-t border-white/10 animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="sticky top-0 z-10 bg-slate-900 px-6 pt-3 pb-2">
          <div className="mx-auto w-12 h-1 rounded-full bg-white/20" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-8 space-y-4">
          {/* Images */}
          {listing.images && listing.images.length > 0 && (
            <ImageCarousel images={listing.images} alt={listing.title} aspectRatio="16/9" />
          )}

          {/* Title & Location */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-white">{listing.title}</h2>
              <AccentBadge label={listing.category} tone="neutral" />
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-white/60">
              <MapPin className="h-4 w-4" />
              {listing.location || 'Danang'}
            </div>
          </div>

          {/* Price */}
          {listing.price && (
            <div className="flex items-center gap-2 text-2xl font-bold text-orange-400">
              <Wallet className="h-6 w-6" />
              {listing.currency || 'USD'} {listing.price}
              <span className="text-base font-normal text-white/50">/month</span>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <p className="text-white/80 leading-relaxed">{listing.description}</p>
          )}

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white/60 mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Button */}
          {listing.contact && (
            <a
              href={
                listing.contact_type === 'telegram'
                  ? `https://t.me/${listing.contact.replace('@', '')}`
                  : listing.contact_type === 'whatsapp'
                  ? `https://wa.me/${listing.contact}`
                  : `mailto:${listing.contact}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 rounded-xl bg-orange-500 text-white text-center font-semibold hover:bg-orange-400 transition-colors"
            >
              Contact via {listing.contact_type || 'Message'}: {listing.contact}
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
