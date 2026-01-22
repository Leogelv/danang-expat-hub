import React from 'react';
import clsx from 'clsx';

export interface AccentBadgeProps {
  label: string;
  tone?: 'ember' | 'tide' | 'aurora' | 'neutral';
  className?: string;
}

const toneStyles: Record<NonNullable<AccentBadgeProps['tone']>, string> = {
  ember: 'bg-orange-500/20 text-orange-200 border-orange-400/40',
  tide: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
  aurora: 'bg-violet-500/20 text-violet-200 border-violet-400/40',
  neutral: 'bg-white/10 text-white/70 border-white/15',
};

export const AccentBadge: React.FC<AccentBadgeProps> = ({
  label,
  tone = 'neutral',
  className,
}) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]',
      toneStyles[tone],
      className,
    )}
  >
    {label}
  </span>
);
