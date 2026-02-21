'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { X, CalendarPlus, MapPin, Clock, Users, DollarSign, Phone } from 'lucide-react';

export interface CreateEventData {
  title: string;
  description: string;
  category: 'social' | 'sports' | 'business' | 'culture' | 'party' | 'other';
  starts_at: string;
  ends_at: string;
  location: string;
  price: number | null;
  max_participants: number | null;
  organizer_contact: string;
}

export interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventData) => Promise<void>;
}

// Модалка создания нового события
export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const t = useTranslations('events');
  const tCommon = useTranslations('common');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CreateEventData['category']>('social');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [organizerContact, setOrganizerContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Сброс формы
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('social');
    setStartsAt('');
    setEndsAt('');
    setLocation('');
    setPrice('');
    setMaxParticipants('');
    setOrganizerContact('');
    setErrorMessage(null);
  };

  // Сабмит формы с обработкой ошибок
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !startsAt || !organizerContact.trim()) return;

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        starts_at: startsAt,
        ends_at: endsAt || startsAt,
        location: location.trim(),
        price: price ? Number(price) : null,
        max_participants: maxParticipants ? Number(maxParticipants) : null,
        organizer_contact: organizerContact.trim(),
      });
      resetForm();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : tCommon('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Стили для инпутов
  const inputCls = clsx(
    'w-full px-3 py-2.5 rounded-xl text-sm',
    'bg-white/5 border border-white/15 text-white placeholder-white/40',
    'focus:outline-none focus:border-cyan-500/50'
  );

  const selectCls = clsx(
    'w-full px-3 py-2.5 rounded-xl text-sm appearance-none',
    'bg-white/5 border border-white/15 text-white',
    'focus:outline-none focus:border-cyan-500/50'
  );

  const categories = [
    { value: 'social', label: 'Social' },
    { value: 'sports', label: 'Sports' },
    { value: 'business', label: 'Business' },
    { value: 'culture', label: 'Culture' },
    { value: 'party', label: 'Party' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto">
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">{t('createEventTitle')}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Title */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">{t('titleLabel')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                placeholder={t('titlePlaceholder')}
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">{t('descriptionLabel')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                maxLength={5000}
                placeholder={t('descriptionPlaceholder')}
                className={clsx(inputCls, 'resize-none')}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">{t('categoryLabel')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CreateEventData['category'])}
                className={selectCls}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Dates — два поля рядом */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-white/70 mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline-block mr-1" />
                  {t('startsAtLabel')}
                </label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-white/70 mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline-block mr-1" />
                  {t('endsAtLabel')}
                </label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">
                <MapPin className="w-3.5 h-3.5 inline-block mr-1" />
                {t('locationLabel')}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('locationPlaceholder')}
                className={inputCls}
              />
            </div>

            {/* Price + Max Participants */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-white/70 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 inline-block mr-1" />
                  {t('priceLabel')}
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min={0}
                  placeholder={t('pricePlaceholder')}
                  className={inputCls}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-white/70 mb-1.5">
                  <Users className="w-3.5 h-3.5 inline-block mr-1" />
                  {t('maxPeopleLabel')}
                </label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  min={1}
                  placeholder={t('maxPeoplePlaceholder')}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Organizer Contact */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">
                <Phone className="w-3.5 h-3.5 inline-block mr-1" />
                {t('organizerLabel')}
              </label>
              <input
                type="text"
                value={organizerContact}
                onChange={(e) => setOrganizerContact(e.target.value)}
                required
                placeholder={t('contactPlaceholder')}
                className={inputCls}
              />
            </div>

            {/* Сообщение об ошибке */}
            {errorMessage && (
              <div className="text-sm text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl">
                {errorMessage}
              </div>
            )}

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
                disabled={!title.trim() || !description.trim() || !startsAt || !organizerContact.trim() || isSubmitting}
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

CreateEventModal.displayName = 'CreateEventModal';
