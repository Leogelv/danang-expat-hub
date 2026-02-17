'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';

// Динамический импорт MapLibre (не работает с SSR)
const Map = dynamic(
  () => import('react-map-gl/maplibre').then((mod) => mod.Map),
  { ssr: false, loading: () => <MapLoadingPlaceholder /> }
);

const Marker = dynamic(
  () => import('react-map-gl/maplibre').then((mod) => mod.Marker),
  { ssr: false }
);

// Плейсхолдер загрузки карты
const MapLoadingPlaceholder: React.FC = () => (
  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
    <div className="text-white/50 text-sm">Loading map...</div>
  </div>
);

export interface MapListing {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  images: string[] | null;
}

export interface RentalsMapProps {
  listings: MapListing[];
  onListingClick?: (listing: MapListing) => void;
  selectedId?: string | null;
  className?: string;
}

// Центр Дананга
const DANANG_CENTER = { latitude: 16.0544, longitude: 108.2300 };
const DEFAULT_ZOOM = 12.5;

// Стиль карты (CartoDB dark matter)
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Маркер с ценой (Airbnb-стиль)
const PriceMarker: React.FC<{
  price: number | null;
  currency: string | null;
  selected?: boolean;
}> = ({ price, currency, selected }) => (
  <div
    className={clsx(
      'px-2 py-1 rounded-full text-xs font-bold shadow-lg transition-all cursor-pointer whitespace-nowrap',
      selected
        ? 'bg-orange-500 text-white scale-110 z-10'
        : 'bg-white text-slate-900 hover:bg-orange-100'
    )}
  >
    {price ? `$${price}` : '?'}
    {price && currency === 'VND' ? 'k' : ''}
  </div>
);

// Мини-карточка при клике на маркер
const ListingPopup: React.FC<{
  listing: MapListing;
  onClose: () => void;
  onClick: () => void;
}> = ({ listing, onClose, onClick }) => (
  <div
    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-800 border border-white/15 rounded-xl shadow-2xl overflow-hidden cursor-pointer"
    onClick={(e) => { e.stopPropagation(); onClick(); }}
  >
    {/* Фото */}
    {listing.images && listing.images[0] && (
      <div className="h-28 w-full overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
      </div>
    )}
    <div className="p-2.5">
      <p className="text-sm font-semibold text-white truncate">{listing.title}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-orange-400 text-sm font-bold">
          {listing.currency || 'USD'} {listing.price}/mo
        </span>
        <span className="text-[11px] text-white/50">{listing.location}</span>
      </div>
    </div>
    {/* Стрелочка вниз */}
    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 border-r border-b border-white/15 rotate-45" />
  </div>
);

export const RentalsMap: React.FC<RentalsMapProps> = ({
  listings,
  onListingClick,
  selectedId,
  className,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [viewState, setViewState] = useState({
    ...DANANG_CENTER,
    zoom: DEFAULT_ZOOM,
  });

  // Фильтруем листинги с координатами
  const geoListings = useMemo(
    () => listings.filter((l) => l.lat !== null && l.lng !== null),
    [listings]
  );

  const handleMarkerClick = useCallback(
    (listing: MapListing) => {
      // Если уже выбран — открываем детали
      if (hoveredId === listing.id) {
        onListingClick?.(listing);
      } else {
        setHoveredId(listing.id);
      }
    },
    [hoveredId, onListingClick]
  );

  const hoveredListing = useMemo(
    () => geoListings.find((l) => l.id === hoveredId) ?? null,
    [geoListings, hoveredId]
  );

  return (
    <div className={clsx('relative w-full h-full rounded-xl overflow-hidden', className)}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={() => setHoveredId(null)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        attributionControl={false}
      >
        {geoListings.map((listing) => (
          <Marker
            key={listing.id}
            latitude={listing.lat!}
            longitude={listing.lng!}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(listing);
            }}
          >
            <div className="relative">
              <PriceMarker
                price={listing.price}
                currency={listing.currency}
                selected={hoveredId === listing.id || selectedId === listing.id}
              />
              {/* Попап при клике */}
              {hoveredId === listing.id && hoveredListing && (
                <ListingPopup
                  listing={hoveredListing}
                  onClose={() => setHoveredId(null)}
                  onClick={() => onListingClick?.(hoveredListing)}
                />
              )}
            </div>
          </Marker>
        ))}
      </Map>

      {/* Счётчик на карте */}
      <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white/80">
        {geoListings.length} on map
      </div>
    </div>
  );
};

RentalsMap.displayName = 'RentalsMap';
