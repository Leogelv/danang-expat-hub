'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTelegramLocation, type LocationData } from '@/fsd/features/community';

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

// Иконка локации пользователя (пульсирующая синяя точка)
const UserLocationMarker: React.FC = () => (
  <div className="relative">
    <div className="absolute -inset-3 bg-cyan-500/30 rounded-full animate-ping" />
    <div className="relative w-4 h-4 bg-cyan-500 border-2 border-white rounded-full shadow-lg" />
  </div>
);

// Иконка маркера поста
const PostMarker: React.FC<{ selected?: boolean }> = ({ selected }) => (
  <div
    className={clsx(
      'w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform',
      selected ? 'bg-cyan-500 scale-125' : 'bg-orange-500'
    )}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  </div>
);

export interface CommunityPost {
  id: string;
  title: string;
  body: string;
  author_name: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  created_at: string;
}

export interface CommunityMapProps {
  posts: CommunityPost[];
  onPostClick?: (post: CommunityPost) => void;
  selectedPostId?: string | null;
  className?: string;
}

// Центр Дананга
const DANANG_CENTER = { latitude: 16.0544, longitude: 108.2022 };
const DEFAULT_ZOOM = 12;

// Стиль карты (CartoDB dark matter)
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const CommunityMap: React.FC<CommunityMapProps> = ({
  posts,
  onPostClick,
  selectedPostId,
  className,
}) => {
  const { location: userLocation, requestLocation, isLoading: isLoadingLocation } = useTelegramLocation();
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  // Запрашиваем геолокацию при монтировании
  useEffect(() => {
    if (!hasRequestedLocation) {
      setHasRequestedLocation(true);
      requestLocation();
    }
  }, [hasRequestedLocation, requestLocation]);

  // Фильтруем посты с геолокацией
  const geotaggedPosts = useMemo(
    () => posts.filter((p) => p.latitude !== null && p.longitude !== null),
    [posts]
  );

  // Начальный viewport
  const [viewState, setViewState] = useState({
    ...DANANG_CENTER,
    zoom: DEFAULT_ZOOM,
  });

  // Центрируем на пользователе если есть валидные координаты
  useEffect(() => {
    if (userLocation && userLocation.latitude != null && userLocation.longitude != null) {
      setViewState((prev) => ({
        ...prev,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        zoom: 14,
      }));
    }
  }, [userLocation]);

  return (
    <div className={clsx('relative w-full h-full rounded-xl overflow-hidden', className)}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        attributionControl={false}
      >
        {/* Маркер пользователя — guard от undefined координат */}
        {userLocation && userLocation.latitude != null && userLocation.longitude != null && (
          <Marker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            anchor="center"
          >
            <UserLocationMarker />
          </Marker>
        )}

        {/* Маркеры постов */}
        {geotaggedPosts.map((post) => (
          <Marker
            key={post.id}
            latitude={post.latitude!}
            longitude={post.longitude!}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onPostClick?.(post);
            }}
          >
            <PostMarker selected={selectedPostId === post.id} />
          </Marker>
        ))}
      </Map>

      {/* Кнопка центрирования на пользователе */}
      <button
        type="button"
        onClick={() => {
          if (userLocation && userLocation.latitude != null && userLocation.longitude != null) {
            setViewState((prev) => ({
              ...prev,
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              zoom: 15,
            }));
          } else {
            requestLocation();
          }
        }}
        disabled={isLoadingLocation}
        className={clsx(
          'absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-colors',
          'bg-slate-800 border border-white/20',
          userLocation ? 'text-cyan-400' : 'text-white/60',
          'hover:bg-slate-700'
        )}
        title="Center on my location"
      >
        {isLoadingLocation ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        )}
      </button>

      {/* Счётчик постов на карте */}
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white/80">
        {geotaggedPosts.length} geotagged posts
      </div>
    </div>
  );
};

CommunityMap.displayName = 'CommunityMap';
