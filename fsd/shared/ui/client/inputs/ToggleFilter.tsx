'use client';

import React from 'react';
import clsx from 'clsx';

export interface ToggleFilterProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// Переключатель для бинарных фильтров (wifi, vegan и т.д.)
export const ToggleFilter: React.FC<ToggleFilterProps> = ({
  label,
  checked,
  onChange,
  description,
  icon,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={clsx(
        'w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer',
        checked
          ? 'bg-cyan-500/10 border-cyan-400/30'
          : 'bg-white/5 border-white/10 hover:bg-white/8'
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span
            className={clsx(
              'text-lg',
              checked ? 'text-cyan-400' : 'text-white/50'
            )}
          >
            {icon}
          </span>
        )}
        <div className="text-left">
          <div
            className={clsx(
              'font-medium text-sm',
              checked ? 'text-white' : 'text-white/80'
            )}
          >
            {label}
          </div>
          {description && (
            <div className="text-xs text-white/40 mt-0.5">{description}</div>
          )}
        </div>
      </div>

      {/* Toggle switch */}
      <div
        className={clsx(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-cyan-500' : 'bg-white/20'
        )}
      >
        <div
          className={clsx(
            'absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </div>
    </button>
  );
};

ToggleFilter.displayName = 'ToggleFilter';
