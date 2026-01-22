'use client';

import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

export interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  onReset?: () => void;
  title?: string;
  children: React.ReactNode;
}

// Боттом-шит для фильтров с жестом свайпа вниз
export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  onApply,
  onReset,
  title,
  children,
}) => {
  const t = useTranslations('common');
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const currentTranslateY = useRef(0);

  // Блокируем скролл body когда шит открыт
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Обработчики touch-жестов для свайпа вниз
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    currentTranslateY.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null || !sheetRef.current) return;
    const diff = e.touches[0].clientY - dragStartY.current;
    if (diff > 0) {
      currentTranslateY.current = diff;
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!sheetRef.current) return;
    // Если свайпнули больше 100px — закрываем
    if (currentTranslateY.current > 100) {
      onClose();
    }
    sheetRef.current.style.transform = '';
    dragStartY.current = null;
    currentTranslateY.current = 0;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={clsx(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-slate-900 border-t border-white/10 rounded-t-3xl',
          'max-h-[85vh] overflow-hidden',
          'animate-in slide-in-from-bottom duration-300'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {title || t('filters')}
          </h3>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {t('reset')}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pb-5 overflow-y-auto max-h-[calc(85vh-140px)]">
          {children}
        </div>

        {/* Actions */}
        <div className="px-5 pb-6 pt-3 border-t border-white/10 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/20 text-white/80 font-medium transition-colors hover:bg-white/5"
          >
            {t('close')}
          </button>
          {onApply && (
            <button
              type="button"
              onClick={() => {
                onApply();
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-semibold transition-colors hover:bg-cyan-400"
            >
              {t('apply')}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

FilterSheet.displayName = 'FilterSheet';
