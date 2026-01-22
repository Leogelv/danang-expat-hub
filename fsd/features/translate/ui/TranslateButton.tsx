'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { useTranslations, useLocale } from 'next-intl';
import { useTranslate, type SourceTable, type FieldName } from '../api/useTranslate';

// Иконка перевода
const TranslateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

export interface TranslateButtonProps {
  sourceTable: SourceTable;
  sourceId: string;
  fieldName: FieldName;
  originalText: string;
  onTranslated?: (translatedText: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

// Кнопка AI-перевода для карточек контента
export const TranslateButton: React.FC<TranslateButtonProps> = ({
  sourceTable,
  sourceId,
  fieldName,
  originalText,
  onTranslated,
  size = 'sm',
  className,
}) => {
  const t = useTranslations('common');
  const locale = useLocale();
  const { translate, isLoading } = useTranslate();
  const [isTranslated, setIsTranslated] = useState(false);

  // Не показываем кнопку если язык английский
  if (locale === 'en') return null;

  const handleClick = async () => {
    if (isLoading || isTranslated) return;

    const result = await translate({
      sourceTable,
      sourceId,
      fieldName,
      originalText,
    });

    if (result) {
      setIsTranslated(true);
      onTranslated?.(result.translatedText);
    }
  };

  const sizeStyles = {
    sm: 'p-1.5',
    md: 'p-2',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || isTranslated}
      title={isTranslated ? t('translated') : t('translate')}
      className={clsx(
        'rounded-lg transition-all duration-200',
        sizeStyles[size],
        isTranslated
          ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
          : 'bg-white/10 text-white/60 hover:bg-cyan-500/20 hover:text-cyan-400',
        isLoading && 'animate-pulse',
        className
      )}
    >
      {isLoading ? (
        <div className={clsx('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])} />
      ) : (
        <TranslateIcon className={iconSizes[size]} />
      )}
    </button>
  );
};

TranslateButton.displayName = 'TranslateButton';
