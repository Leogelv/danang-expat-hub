import React from 'react';
import clsx from 'clsx';
import { backgroundTokens, ScreenVariant } from '../tokens';

export interface AppScreenProps {
  variant?: ScreenVariant;
  className?: string;
  children: React.ReactNode;
  contentClassName?: string;
  withBottomMenu?: boolean;
}

export const AppScreen: React.FC<AppScreenProps> = ({
  variant = 'ember',
  className,
  children,
  contentClassName,
  withBottomMenu = false,
}) => {
  const tokens = backgroundTokens[variant];

  return (
    <div
      className={clsx(
        'relative flex min-h-screen min-h-[100dvh] w-full flex-col overflow-hidden rounded-[32px]',
        className,
      )}
    >
      <div className={clsx('pointer-events-none absolute inset-0', tokens.base)} />
      {tokens.blobs.map((blob, index) => (
        <div key={index} className={clsx('pointer-events-none absolute rounded-full blur-3xl', blob)} />
      ))}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
      <div
        className={clsx(
          'relative z-10 flex flex-1 flex-col gap-6 p-6',
          withBottomMenu && 'pb-[calc(6rem+var(--tg-total-safe-area-bottom,0px))]',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
};
