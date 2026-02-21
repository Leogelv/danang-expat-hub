'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { X, MapPinPlus, Wifi, Leaf } from 'lucide-react';

export interface SuggestPlaceData {
  name: string;
  description: string;
  category: 'cafe' | 'restaurant' | 'coworking' | 'gym' | 'bar' | 'spa' | 'shop' | 'other';
  address: string;
  price_level: '$' | '$$' | '$$$';
  has_wifi: boolean;
  is_vegan_friendly: boolean;
}

export interface SuggestPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SuggestPlaceData) => Promise<void>;
}

// Модалка предложения нового места
export const SuggestPlaceModal: React.FC<SuggestPlaceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const t = useTranslations('places');
  const tCommon = useTranslations('common');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SuggestPlaceData['category']>('cafe');
  const [address, setAddress] = useState('');
  const [priceLevel, setPriceLevel] = useState<SuggestPlaceData['price_level']>('$$');
  const [hasWifi, setHasWifi] = useState(false);
  const [isVeganFriendly, setIsVeganFriendly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Сброс формы
  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('cafe');
    setAddress('');
    setPriceLevel('$$');
    setHasWifi(false);
    setIsVeganFriendly(false);
    setErrorMessage(null);
  };

  // Сабмит формы с обработкой ошибок
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !address.trim()) return;

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category,
        address: address.trim(),
        price_level: priceLevel,
        has_wifi: hasWifi,
        is_vegan_friendly: isVeganFriendly,
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
    { value: 'cafe', label: 'Cafe' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'coworking', label: 'Coworking' },
    { value: 'gym', label: 'Gym' },
    { value: 'bar', label: 'Bar' },
    { value: 'spa', label: 'Spa' },
    { value: 'shop', label: 'Shop' },
    { value: 'other', label: 'Other' },
  ];

  const priceLevels = [
    { value: '$', label: '$ — Budget' },
    { value: '$$', label: '$$ — Mid-range' },
    { value: '$$$', label: '$$$ — Premium' },
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
              <MapPinPlus className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">{t('suggestTitle')}</h3>
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
            {/* Name */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">{t('nameLabel')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={200}
                placeholder={t('namePlaceholder')}
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

            {/* Category + Price Level */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-white/70 mb-1.5">{t('categoryLabel')}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SuggestPlaceData['category'])}
                  className={selectCls}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="w-40">
                <label className="block text-sm text-white/70 mb-1.5">{t('priceLevelLabel')}</label>
                <select
                  value={priceLevel}
                  onChange={(e) => setPriceLevel(e.target.value as SuggestPlaceData['price_level'])}
                  className={selectCls}
                >
                  {priceLevels.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">{t('addressLabel')}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder={t('addressPlaceholder')}
                className={inputCls}
              />
            </div>

            {/* Feature toggles — WiFi и Vegan */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setHasWifi(!hasWifi)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors border',
                  hasWifi
                    ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300'
                    : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10'
                )}
              >
                <Wifi className="w-4 h-4" />
                <span>{t('wifiLabel')}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsVeganFriendly(!isVeganFriendly)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors border',
                  isVeganFriendly
                    ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                    : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10'
                )}
              >
                <Leaf className="w-4 h-4" />
                <span>{t('veganLabel')}</span>
              </button>
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
                disabled={!name.trim() || !description.trim() || !address.trim() || isSubmitting}
                className={clsx(
                  'flex-1 py-3 rounded-xl font-semibold transition-colors',
                  'bg-cyan-500 text-white hover:bg-cyan-400',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? tCommon('loading') : t('suggestButton')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

SuggestPlaceModal.displayName = 'SuggestPlaceModal';
