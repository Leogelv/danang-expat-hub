'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Filter, MapPin, MessageCircle, Wallet, X, Map as MapIcon, List, ArrowUpDown } from 'lucide-react';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { ImageCarousel } from '@/fsd/shared/ui/client/media/ImageCarousel';
import { AppShell } from '@/fsd/shared/components/AppShell';
import { useRemoteData } from '@/fsd/shared/hooks/useRemoteData';
import { RentalsMap } from '@/fsd/widgets/rentals/RentalsMap';

/* ==========================================
   Типы
   ========================================== */
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
  lat: number | null;
  lng: number | null;
}

type Tab = 'housing' | 'bike';
type SortMode = 'newest' | 'price_asc' | 'price_desc';

/* ==========================================
   Константы
   ========================================== */
const LOCATION_OPTIONS = ['An Thuong', 'My Khe', 'Son Tra', 'Ngu Hanh Son', 'Hai Chau'];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

const TAB_CONFIG: Record<Tab, { label: string; icon: string; desc: string }> = {
  housing: { label: 'Housing', icon: '🏠', desc: 'Studios, apartments, and villas for 1+ month stays.' },
  bike: { label: 'Bikes', icon: '🏍', desc: 'Reliable scooters with delivery and helmets included.' },
};

/* ==========================================
   Главный компонент
   ========================================== */
export const RentalsPage: React.FC = () => {
  // Загрузка данных
  const { data: housing, isLoading: housingLoading } = useRemoteData<Listing>('/api/listings?category=housing');
  const { data: bikes, isLoading: bikesLoading } = useRemoteData<Listing>('/api/listings?category=bike');

  // Состояние UI
  const [activeTab, setActiveTab] = useState<Tab>('housing');
  const [search, setSearch] = useState('');
  const [activeLocation, setActiveLocation] = useState('All');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Текущие данные по активному табу
  const rawData = activeTab === 'housing' ? housing : bikes;
  const isLoading = activeTab === 'housing' ? housingLoading : bikesLoading;

  // Авто-определение диапазона цен при загрузке данных
  const priceBounds = useMemo(() => {
    const prices = rawData.filter((l) => l.price != null).map((l) => l.price!);
    if (prices.length === 0) return { min: 0, max: 1000 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [rawData]);

  // Инициализация слайдера при смене таба / загрузке данных
  useMemo(() => {
    if (rawData.length > 0) {
      setPriceRange([priceBounds.min, priceBounds.max]);
      setPriceInitialized(true);
    }
  }, [priceBounds, rawData.length]);

  // Фильтрация + сортировка
  const filteredData = useMemo(() => {
    let result = rawData.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesLocation = activeLocation === 'All' || item.location === activeLocation;
      const matchesPrice =
        item.price == null ||
        (item.price >= priceRange[0] && item.price <= priceRange[1]);
      return matchesSearch && matchesLocation && matchesPrice;
    });

    // Сортировка
    result = [...result].sort((a, b) => {
      switch (sortMode) {
        case 'price_asc':
          return (a.price ?? 0) - (b.price ?? 0);
        case 'price_desc':
          return (b.price ?? 0) - (a.price ?? 0);
        default:
          return 0; // newest — порядок из API (created_at desc)
      }
    });

    return result;
  }, [rawData, search, activeLocation, priceRange, sortMode]);

  // Переключение таба — сброс фильтров
  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setSearch('');
    setActiveLocation('All');
    setSortMode('newest');
    setPriceInitialized(false);
    setShowMap(false);
  }, []);

  return (
    <AppShell
      eyebrow="Rentals"
      title="Housing and motorbikes"
      description="Browse long-term apartments, villas, and trusted bike rentals with direct contacts."
      variant="sunset"
      action={<AccentBadge label="Verified" tone="ember" />}
    >
      {/* ====== Табы ====== */}
      <div className="flex gap-2">
        {(Object.keys(TAB_CONFIG) as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-orange-500/20 border border-orange-400/50 text-white'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <span>{TAB_CONFIG[tab].icon}</span>
            <span>{TAB_CONFIG[tab].label}</span>
            {!isLoading && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? 'bg-orange-500/30' : 'bg-white/10'
              }`}>
                {(activeTab === tab ? filteredData : rawData).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ====== Фильтры ====== */}
      <GlassCard className="flex flex-col gap-3" padding="md">
        {/* Поиск + Map toggle */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <Filter className="h-4 w-4 text-white/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/40 focus:outline-none"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-white/40 hover:text-white/70">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
              showMap
                ? 'border-orange-400/50 bg-orange-500/20 text-white'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {showMap ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            {showMap ? 'List' : 'Map'}
          </button>
        </div>

        {/* Локации */}
        <div className="flex flex-wrap gap-1.5">
          {['All', ...LOCATION_OPTIONS].map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setActiveLocation(loc)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                activeLocation === loc
                  ? 'border-orange-400/60 bg-orange-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:text-white/80'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Ценовой слайдер */}
        {priceInitialized && priceBounds.max > priceBounds.min && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Price range
              </span>
              <span className="text-white/80 font-medium">
                ${priceRange[0]} — ${priceRange[1]}
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                value={priceRange[0]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPriceRange(([, max]) => [Math.min(v, max), max]);
                }}
                className="flex-1 accent-orange-500 h-1"
              />
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                value={priceRange[1]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPriceRange(([min]) => [min, Math.max(v, min)]);
                }}
                className="flex-1 accent-orange-500 h-1"
              />
            </div>
          </div>
        )}

        {/* Сортировка */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-white/50" />
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSortMode(opt.value)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                sortMode === opt.value
                  ? 'border-orange-400/60 bg-orange-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:text-white/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* ====== Контент: Карта или Список ====== */}
      {showMap ? (
        <div className="h-[65vh] rounded-xl overflow-hidden">
          <RentalsMap
            listings={filteredData}
            onListingClick={(l) => {
              const full = filteredData.find((f) => f.id === l.id);
              if (full) setSelectedListing(full);
            }}
            selectedId={selectedListing?.id}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{TAB_CONFIG[activeTab].label}</h3>
              <p className="text-sm text-white/60">{TAB_CONFIG[activeTab].desc}</p>
            </div>
            <AccentBadge label={String(filteredData.length)} tone="neutral" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {isLoading && <LoadingCard />}
            {!isLoading && filteredData.length === 0 && (
              <EmptyState message="No listings found. Try adjusting filters or ask the AI assistant." />
            )}
            {filteredData.map((item) => (
              <ListingCard key={item.id} item={item} onClick={() => setSelectedListing(item)} />
            ))}
          </div>
        </div>
      )}

      {/* ====== Detail Sheet ====== */}
      <ListingDetailSheet
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
      />
    </AppShell>
  );
};

/* ==========================================
   Карточка листинга
   ========================================== */
const ListingCard: React.FC<{ item: Listing; onClick: () => void }> = ({ item, onClick }) => (
  <GlassCard
    className="flex h-full flex-col gap-3 cursor-pointer hover:border-white/20 transition-colors"
    padding="md"
    onClick={onClick}
  >
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

/* ==========================================
   Detail Sheet
   ========================================== */
const ListingDetailSheet: React.FC<{
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ listing, isOpen, onClose }) => {
  if (!isOpen || !listing) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-slate-900 border-t border-white/10 animate-in slide-in-from-bottom duration-300">
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
          {listing.images && listing.images.length > 0 && (
            <ImageCarousel images={listing.images} alt={listing.title} aspectRatio="16/9" />
          )}
          <div>
            <h2 className="text-xl font-bold text-white">{listing.title}</h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-white/60">
              <MapPin className="h-4 w-4" />
              {listing.location || 'Danang'}
            </div>
          </div>
          {listing.price && (
            <div className="flex items-center gap-2 text-2xl font-bold text-orange-400">
              <Wallet className="h-6 w-6" />
              {listing.currency || 'USD'} {listing.price}
              <span className="text-base font-normal text-white/50">/month</span>
            </div>
          )}
          {listing.description && (
            <p className="text-white/80 leading-relaxed">{listing.description}</p>
          )}
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

/* ==========================================
   Утилитарные компоненты
   ========================================== */
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
