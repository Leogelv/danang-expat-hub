'use client';

import { useState, useCallback } from 'react';
import { postEvent, on } from '@telegram-apps/sdk-react';

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

// Хук для запроса геолокации через Telegram Mini App API
export function useTelegramLocation(): UseTelegramLocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Проверяем доступность Telegram WebApp
      if (typeof window === 'undefined' || !(window as any).Telegram?.WebApp) {
        // Fallback на браузерную геолокацию
        return await requestBrowserLocation();
      }

      // Запрашиваем геолокацию через Telegram
      return await requestTelegramLocation();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Запрос через Telegram Mini App API
  const requestTelegramLocation = (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        setError('Location request timeout');
        resolve(null);
      }, 30000);

      // Слушаем событие location_requested
      const cleanup = on('location_requested', (payload: any) => {
        clearTimeout(timeout);

        if (payload && payload.location_available !== false) {
          const loc: LocationData = {
            latitude: payload.latitude,
            longitude: payload.longitude,
            accuracy: payload.horizontal_accuracy,
          };
          setLocation(loc);
          resolve(loc);
        } else {
          setError('Location not available');
          resolve(null);
        }
      });

      // Отправляем запрос на геолокацию
      try {
        postEvent('web_app_request_location');
      } catch {
        clearTimeout(timeout);
        cleanup();
        // Fallback на браузер если postEvent не работает
        requestBrowserLocation().then(resolve);
      }
    });
  };

  // Fallback на браузерную Geolocation API
  const requestBrowserLocation = (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation not supported');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(loc);
          resolve(loc);
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
