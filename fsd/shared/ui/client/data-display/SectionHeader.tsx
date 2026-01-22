import React from 'react';
import clsx from 'clsx';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: 'start' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  action,
  align = 'start',
  tone = 'light',
  className,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const alignStyles = align === 'center' ? 'items-center text-center' : 'items-start text-left';
  const toneStylesHeader = tone === 'light' ? 'text-white' : 'text-slate-900';
  const toneStylesDescription = tone === 'light' ? 'text-white/70' : 'text-slate-600';

  const shouldTruncate = description && description.length > 150;
  const displayedDescription = shouldTruncate && !isExpanded
    ? description.slice(0, 150) + '...'
    : description;

  return (
    <div className={clsx('flex flex-col gap-3', alignStyles, className)}>
      <div className="flex w-full items-start justify-between gap-3">
        <div className={clsx('flex flex-col gap-2', toneStylesHeader)}>
          {eyebrow && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              {eyebrow}
            </span>
          )}
          <h2 className="text-2xl font-semibold leading-tight">{title}</h2>
          {description && (
            <div>
              <p className={clsx('text-sm leading-6', toneStylesDescription)}>
                {displayedDescription}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={clsx(
                    'mt-1 text-xs font-medium transition-colors',
                    tone === 'light' ? 'text-white/80 hover:text-white' : 'text-slate-500 hover:text-slate-700',
                  )}
                >
                  {isExpanded ? 'Collapse' : 'Read more'}
                </button>
              )}
            </div>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center">{action}</div>}
      </div>
    </div>
  );
};
