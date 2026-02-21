'use client';

import { useEffect, useMemo, useState } from 'react';

interface UseViewportOptions {
  mobileBreakpoint?: number;
  trackKeyboard?: boolean;
}

interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  keyboardOffset: number;
}

const DEFAULT_BREAKPOINT = 768;

const getInitialState = (breakpoint: number): ViewportState => ({
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  height: typeof window !== 'undefined' ? window.innerHeight : 0,
  isMobile: typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false,
  keyboardOffset: 0,
});

export const useViewport = (options?: UseViewportOptions): ViewportState => {
  const { mobileBreakpoint = DEFAULT_BREAKPOINT, trackKeyboard = false } = options || {};
  const [viewport, setViewport] = useState<ViewportState>(() => getInitialState(mobileBreakpoint));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDimensions = () => {
      setViewport((prev) => {
        const nextWidth = window.innerWidth;
        const nextHeight = window.innerHeight;
        const nextIsMobile = nextWidth <= mobileBreakpoint;

        if (
          prev.width === nextWidth &&
          prev.height === nextHeight &&
          prev.isMobile === nextIsMobile
        ) {
          return prev;
        }

        return {
          ...prev,
          width: nextWidth,
          height: nextHeight,
          isMobile: nextIsMobile,
        };
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [mobileBreakpoint]);

  useEffect(() => {
    if (!trackKeyboard || typeof window === 'undefined') return;

    const viewportApi = window.visualViewport;
    if (!viewportApi) {
      setViewport((prev) => (prev.keyboardOffset === 0 ? prev : { ...prev, keyboardOffset: 0 }));
      return;
    }

    const handleViewportChange = () => {
      const offset = window.innerWidth <= mobileBreakpoint
        ? Math.max(0, window.innerHeight - viewportApi.height)
        : 0;

      setViewport((prev) => (prev.keyboardOffset === offset ? prev : { ...prev, keyboardOffset: offset }));
    };

    handleViewportChange();
    viewportApi.addEventListener('resize', handleViewportChange);
    viewportApi.addEventListener('scroll', handleViewportChange);

    return () => {
      viewportApi.removeEventListener('resize', handleViewportChange);
      viewportApi.removeEventListener('scroll', handleViewportChange);
    };
  }, [mobileBreakpoint, trackKeyboard]);

  return useMemo(() => viewport, [viewport]);
};
