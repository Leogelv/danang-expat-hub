import React from 'react';
import clsx from 'clsx';
import { accentGradients } from '../tokens';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: keyof typeof accentGradients;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<NonNullable<ActionButtonProps['size']>, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ tone = 'ember', size = 'md', className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full border border-white/15 text-white shadow-[0_18px_45px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100',
        `bg-gradient-to-r ${accentGradients[tone]}`,
        sizeStyles[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  ),
);
ActionButton.displayName = 'ActionButton';
