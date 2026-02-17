'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { X, ShoppingBag, DollarSign, Phone, Tag } from 'lucide-react';

export interface CreateMarketItemData {
  title: string;
  description: string;
  price: number;
  currency: 'USD' | 'VND';
  category: 'electronics' | 'furniture' | 'vehicles' | 'clothing' | 'sports' | 'other';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  contact: string;
}

export interface CreateMarketItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMarketItemData) => Promise<void>;
}

// Модалка создания товара на маркетплейсе
export const CreateMarketItemModal: React.FC<CreateMarketItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const t = useTranslations('market');
  const tCommon = useTranslations('common');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'VND'>('USD');
  const [category, setCategory] = useState<CreateMarketItemData['category']>('electronics');
  const [condition, setCondition] = useState<CreateMarketItemData['condition']>('good');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Сброс формы
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCurrency('USD');
    setCategory('electronics');
    setCondition('good');
    setContact('');
  };

  // Сабмит формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price || !contact.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        currency,
        category,
        condition,
        contact: contact.trim(),
      });
      resetForm();
      onClose();
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
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' },
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
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
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Sell Item</h3>
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
              <label className="block text-sm text-white/70 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                placeholder="e.g. MacBook Pro 14 inch 2024"
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                maxLength={5000}
                placeholder="Describe condition, specs, reason for selling..."
                className={clsx(inputCls, 'resize-none')}
              />
            </div>

            {/* Price + Currency */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-white/70 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 inline-block mr-1" />
                  Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min={0}
                  placeholder="250"
                  className={inputCls}
                />
              </div>
              <div className="w-28">
                <label className="block text-sm text-white/70 mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'USD' | 'VND')}
                  className={selectCls}
                >
                  <option value="USD">USD</option>
                  <option value="VND">VND</option>
                </select>
              </div>
            </div>

            {/* Category + Condition — в одну строку */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-white/70 mb-1.5">
                  <Tag className="w-3.5 h-3.5 inline-block mr-1" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CreateMarketItemData['category'])}
                  className={selectCls}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-white/70 mb-1.5">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as CreateMarketItemData['condition'])}
                  className={selectCls}
                >
                  {conditions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm text-white/70 mb-1.5">
                <Phone className="w-3.5 h-3.5 inline-block mr-1" />
                Contact
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                placeholder="Phone, Telegram, Zalo..."
                className={inputCls}
              />
            </div>

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
                disabled={!title.trim() || !description.trim() || !price || !contact.trim() || isSubmitting}
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

CreateMarketItemModal.displayName = 'CreateMarketItemModal';
