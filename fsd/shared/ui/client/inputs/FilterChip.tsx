'use client';

import React from 'react';
import clsx from 'clsx';

export interface FilterChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  count?: number;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

// Кнопка-фильтр (чип) для выбора категорий/опций
export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected = false,
  onClick,
  count,
  icon,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3.5 py-2 text-sm gap-1.5',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center rounded-full border transition-all duration-200',
        sizeStyles[size],
        selected
          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
          : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10 hover:border-white/25'
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="font-medium">{label}</span>
      {count !== undefined && (
        <span
          className={clsx(
            'ml-1 text-xs',
            selected ? 'text-cyan-400' : 'text-white/40'
          )}
        >
          ({count})
        </span>
      )}
    </button>
  );
};

FilterChip.displayName = 'FilterChip';
