'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useTelegramLocation, type LocationData } from '../../request-location';

// Иконка геолокации
const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export interface CreatePostData {
  title: string;
  body: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
}

export interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostData) => Promise<void>;
}

// Модалка создания нового поста
export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');
  const { location, isLoading: isLoadingLocation, requestLocation } = useTelegramLocation();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [includeLocation, setIncludeLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Обработчик запроса геолокации
  const handleLocationToggle = async () => {
    if (!includeLocation && !location) {
      const loc = await requestLocation();
      if (loc) {
        setIncludeLocation(true);
      }
    } else {
      setIncludeLocation(!includeLocation);
    }
  };

  // Сабмит формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);

      await onSubmit({
        title: title.trim(),
        body: body.trim(),
        tags,
        ...(includeLocation && location
          ? { latitude: location.latitude, longitude: location.longitude }
          : {}),
      });

      // Сброс формы
      setTitle('');
      setBody('');
      setTagsInput('');
      setIncludeLocation(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto">
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{t('newPost')}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-white/50 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">{t('postTitle')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className={clsx(
                  'w-full px-3 py-2.5 rounded-xl text-sm',
                  'bg-white/5 border border-white/15 text-white placeholder-white/40',
                  'focus:outline-none focus:border-cyan-500/50'
                )}
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">{t('postBody')}</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={4}
                maxLength={5000}
                className={clsx(
                  'w-full px-3 py-2.5 rounded-xl text-sm resize-none',
                  'bg-white/5 border border-white/15 text-white placeholder-white/40',
                  'focus:outline-none focus:border-cyan-500/50'
                )}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">{t('tags')}</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder={t('tagsHint')}
                className={clsx(
                  'w-full px-3 py-2.5 rounded-xl text-sm',
                  'bg-white/5 border border-white/15 text-white placeholder-white/40',
                  'focus:outline-none focus:border-cyan-500/50'
                )}
              />
            </div>

            {/* Location toggle */}
            <button
              type="button"
              onClick={handleLocationToggle}
              disabled={isLoadingLocation}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors',
                includeLocation && location
                  ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300'
                  : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10',
                'border'
              )}
            >
              <LocationIcon className="w-4 h-4" />
              <span>
                {isLoadingLocation
                  ? tCommon('loading')
                  : includeLocation && location
                  ? t('geotagged')
                  : t('shareLocation')}
              </span>
            </button>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white/80 font-medium hover:bg-white/5 transition-colors"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !body.trim() || isSubmitting}
                className={clsx(
                  'flex-1 py-3 rounded-xl font-semibold transition-colors',
                  'bg-cyan-500 text-white hover:bg-cyan-400',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? tCommon('loading') : tCommon('create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

CreatePostModal.displayName = 'CreatePostModal';
