'use client';

import { useState, useCallback } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface UseTelegramLocationResult {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<LocationData | null>;
  clearLocation: () => void;
}

// Хук для запроса геолокации через Telegram Mini App LocationManager API
export function useTelegramLocation(): UseTelegramLocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Пробуем нативный Telegram LocationManager API
      const tgWebApp = (window as any)?.Telegram?.WebApp;
      if (tgWebApp?.LocationManager) {
        const loc = await requestViaLocationManager(tgWebApp.LocationManager);
        if (loc) {
          setLocation(loc);
          setIsLoading(false);
          return loc;
        }
      }

      // Fallback на браузерную Geolocation API
      const loc = await requestBrowserLocation();
      if (loc) setLocation(loc);
      return loc;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Запрос через Telegram LocationManager (нативный API)
  const requestViaLocationManager = (lm: any): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 15000);

      // Инициализируем LocationManager если ещё не инициализирован
      const doGetLocation = () => {
        if (!lm.isLocationAvailable) {
          clearTimeout(timeout);
          resolve(null);
          return;
        }

        lm.getLocation((data: any) => {
          clearTimeout(timeout);
          if (data && data.latitude != null && data.longitude != null) {
            resolve({
              latitude: data.latitude,
              longitude: data.longitude,
              accuracy: data.horizontal_accuracy,
            });
          } else {
            resolve(null);
          }
        });
      };

      if (lm.isInited) {
        doGetLocation();
      } else {
        lm.init(() => {
          doGetLocation();
        });
      }
    });
  };

  // Fallback на браузерную Geolocation API
  const requestBrowserLocation = (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        setError('Geolocation not supported');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (err) => {
          setError(err.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        }
      );
    });
  };

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    location,
    isLoading,
    error,
    requestLocation,
    clearLocation,
  };
}
