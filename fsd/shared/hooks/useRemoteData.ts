'use client';

import { useCallback, useEffect, useState } from 'react';

export function useRemoteData<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((prev) => prev + 1), []);

  useEffect(() => {
    if (!url) {
      setData([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    fetch(url)
      .then((res) => res.json())
      .then((payload) => {
        if (!active) return;
        setData(payload.data ?? []);
        if (payload.error) {
          setError(payload.error);
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load data');
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [url, refreshKey]);

  return { data, isLoading, error, refresh };
}
