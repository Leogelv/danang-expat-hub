'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Handshake, Search, Tag, X, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { ImageCarousel } from '@/fsd/shared/ui/client/media/ImageCarousel';
import { AppShell } from '@/fsd/shared/components/AppShell';
import { useRemoteData } from '@/fsd/shared/hooks/useRemoteData';
import { CreateMarketItemModal, type CreateMarketItemData } from '@/fsd/features/market/create-item';

interface MarketItem {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
  condition: string | null;
  contact: string | null;
  images: string[] | null;
}

export const MarketPage: React.FC = () => {
  const t = useTranslations('market');
  const tCommon = useTranslations('common');

  const { data, isLoading, refresh } = useRemoteData<MarketItem>('/api/market');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return data.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  // Создание нового товара
  const handleCreateItem = useCallback(async (formData: CreateMarketItemData) => {
    const res = await fetch('/api/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) refresh();
  }, [refresh]);

  return (
    <AppShell
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      variant="midnight"
      action={
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('sellItem')}
        </button>
      }
    >
      {/* Поиск */}
      <GlassCard className="flex items-center gap-3" padding="md">
        <Search className="h-4 w-4 text-white/60" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/40 focus:outline-none"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="text-white/40 hover:text-white/70">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </GlassCard>

      {/* Список товаров */}
      <div className="grid gap-3 lg:grid-cols-2">
        {isLoading && <LoadingCard />}
        {!isLoading && filtered.length === 0 && (
          <EmptyState message={tCommon('noResults')} />
        )}
        {filtered.map((item) => (
          <MarketCard key={item.id} item={item} onClick={() => setSelectedItem(item)} contactLabel={t('contactSeller')} />
        ))}
      </div>

      {/* Detail Sheet */}
      <MarketDetailSheet
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        contactLabel={t('contactSeller')}
      />

      {/* Create Modal */}
      <CreateMarketItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateItem}
      />
    </AppShell>
  );
};

const MarketCard: React.FC<{ item: MarketItem; onClick: () => void; contactLabel: string }> = ({ item, onClick }) => {
  const t = useTranslations('market');
  return (
  <GlassCard
    className="flex h-full flex-col gap-3 cursor-pointer hover:border-white/20 transition-colors"
    padding="md"
    onClick={onClick}
  >
    {/* Image */}
    {item.images && item.images.length > 0 && (
      <div onClick={(e) => e.stopPropagation()}>
        <ImageCarousel images={item.images} alt={item.title} aspectRatio="4/3" />
      </div>
    )}

    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold text-white">{item.title}</h3>
        {item.category && <p className="text-xs text-white/60">{item.category}</p>}
      </div>
      <AccentBadge label={item.condition || t('conditionUsed')} tone="neutral" />
    </div>
    {item.description && <p className="text-sm text-white/70 line-clamp-2">{item.description}</p>}
    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 mt-auto">
      {item.price && (
        <span className="flex items-center gap-1 text-cyan-400 font-semibold">
          <Tag className="h-3 w-3" />
          {item.currency || 'USD'} {item.price}
        </span>
      )}
      {item.contact && (
        <span className="flex items-center gap-1">
          <Handshake className="h-3 w-3" />
          {item.contact}
        </span>
      )}
    </div>
  </GlassCard>
  );
};

// Detail Sheet
const MarketDetailSheet: React.FC<{
  item: MarketItem | null;
  isOpen: boolean;
  onClose: () => void;
  contactLabel: string;
}> = ({ item, isOpen, onClose, contactLabel }) => {
  const t = useTranslations('market');
  if (!isOpen || !item) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-slate-900 border-t border-white/10 animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 z-10 bg-slate-900 px-6 pt-3 pb-2">
          <div className="mx-auto w-12 h-1 rounded-full bg-white/20" />
          <button onClick={onClose} className="absolute right-4 top-4 p-2 text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-8 space-y-4">
          {item.images && item.images.length > 0 && (
            <ImageCarousel images={item.images} alt={item.title} aspectRatio="4/3" />
          )}

          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-white">{item.title}</h2>
              <AccentBadge label={item.condition || t('conditionUsed')} tone="neutral" />
            </div>
            {item.category && <p className="text-sm text-white/60 mt-1">{item.category}</p>}
          </div>

          {item.price && (
            <div className="flex items-center gap-2 text-2xl font-bold text-cyan-400">
              <Tag className="h-6 w-6" />
              {item.currency || 'USD'} {item.price}
            </div>
          )}

          {item.description && <p className="text-white/80 leading-relaxed">{item.description}</p>}

          {item.contact && (
            <a
              href={`https://t.me/${item.contact.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 rounded-xl bg-cyan-500 text-white text-center font-semibold hover:bg-cyan-400 transition-colors"
            >
              {contactLabel}: {item.contact}
            </a>
          )}
        </div>
      </div>
    </>
  );
};

const LoadingCard = () => (
  <GlassCard className="h-48 animate-pulse bg-white/5" padding="md">
    <div className="h-24 w-full rounded-xl bg-white/10 mb-3" />
    <div className="h-4 w-1/2 rounded bg-white/10" />
  </GlassCard>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <GlassCard className="border-dashed border-white/15" padding="lg">
    <p className="text-sm text-white/60">{message}</p>
  </GlassCard>
);
