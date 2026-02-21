'use client';

import React from 'react';
import clsx from 'clsx';
import { useViewport } from '@/fsd/shared/lib/useViewport';

interface SafeAreaPageProps {
  className?: string;
  children: React.ReactNode;
}

export const SafeAreaPage: React.FC<SafeAreaPageProps> = ({ className, children }) => {
  const { isMobile } = useViewport();

  return (
    <div
      className={clsx(
        'fixed inset-0',
        isMobile ? 'tg-safe-page' : 'tg-safe-page-desktop',
        className,
      )}
    >
      {children}
    </div>
  );
};
