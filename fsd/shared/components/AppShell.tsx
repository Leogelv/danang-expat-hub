'use client';

import React from 'react';
import { AppScreen, SectionHeader, type AppScreenProps } from '@/fsd/shared/ui/client';
import { BottomNav } from './BottomNav';

interface AppShellProps extends AppScreenProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  eyebrow,
  title,
  description,
  action,
  children,
  variant = 'ember',
  contentClassName,
  ...rest
}) => (
  <AppScreen
    variant={variant}
    withBottomMenu
    contentClassName={['gap-5', contentClassName].filter(Boolean).join(' ')}
    {...rest}
  >
    <SectionHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
      action={action}
    />
    {children}
    <BottomNav />
  </AppScreen>
);
