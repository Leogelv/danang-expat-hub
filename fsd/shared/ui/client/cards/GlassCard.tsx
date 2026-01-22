import React from 'react';
import clsx from 'clsx';

export type GlassTone = 'carbon' | 'frost';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: GlassTone;
  padding?: 'sm' | 'md' | 'lg';
}

const toneStyles: Record<GlassTone, string> = {
  carbon: 'border-white/10 bg-slate-900/65 text-white/90 shadow-[0_24px_60px_rgba(5,14,34,0.55)] backdrop-blur-2xl',
  frost: 'border-white/40 bg-white/85 text-slate-900 shadow-[0_24px_60px_rgba(28,32,45,0.35)] backdrop-blur-xl',
};

const paddingStyles: Record<NonNullable<GlassCardProps['padding']>, string> = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-7',
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ tone = 'carbon', className, padding = 'md', children, ...rest }, ref) => (
    <div
      ref={ref}
      className={clsx('rounded-3xl border transition-shadow duration-200', toneStyles[tone], paddingStyles[padding], className)}
      {...rest}
    >
      {children}
    </div>
  ),
);
GlassCard.displayName = 'GlassCard';
