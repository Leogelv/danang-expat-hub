'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { CalendarDays, MapPin, Users, Search, X, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { AppShell } from '@/fsd/shared/components/AppShell';
import { useRemoteData } from '@/fsd/shared/hooks/useRemoteData';
import { useAuth } from '@/fsd/app/providers/AuthProvider';
import { CreateEventModal, type CreateEventData } from '@/fsd/features/events/create-event';
import { EventDetailSheet, type EventDetail } from '@/fsd/widgets/events';

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  category: string | null;
  max_participants: number | null;
  organizer_contact: string | null;
  price: number | null;
  attendees_count?: number;
  created_at: string | null;
}

export const EventsPage: React.FC = () => {
  const t = useTranslations('events');
  const tCommon = useTranslations('common');
  const { user } = useAuth();

  const { data, isLoading, refresh } = useRemoteData<EventItem>('/api/events');

  // Состояние UI
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Фильтрация по поиску
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((event) =>
      event.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // Создание нового события
  const handleCreateEvent = useCallback(async (formData: CreateEventData) => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) refresh();
  }, [refresh]);

  // Преобразование EventItem в EventDetail для EventDetailSheet
  const eventDetail: EventDetail | null = useMemo(() => {
    if (!selectedEvent) return null;
    return {
      id: selectedEvent.id,
      title: selectedEvent.title,
      description: selectedEvent.description || '',
      category: selectedEvent.category || 'other',
      starts_at: selectedEvent.starts_at || new Date().toISOString(),
      ends_at: selectedEvent.ends_at || null,
      location: selectedEvent.location,
      price: selectedEvent.price ?? null,
      max_participants: selectedEvent.max_participants,
      organizer_contact: selectedEvent.organizer_contact,
      attendees_count: selectedEvent.attendees_count,
      created_at: selectedEvent.created_at || new Date().toISOString(),
    };
  }, [selectedEvent]);

  return (
    <AppShell
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      variant="aurora"
      action={
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('createEvent')}
        </button>
      }
    >
      {/* Поиск */}
      <GlassCard className="flex items-center gap-3" padding="md">
        <Search className="h-4 w-4 text-white/60" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/40 focus:outline-none"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="text-white/40 hover:text-white/70">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </GlassCard>

      {/* Список событий */}
      <div className="grid gap-3 lg:grid-cols-2">
        {isLoading && <LoadingCard />}
        {!isLoading && filteredData.length === 0 && (
          <EmptyState message={tCommon('noResults')} />
        )}
        {filteredData.map((event) => (
          <GlassCard
            key={event.id}
            className="flex h-full flex-col gap-3 cursor-pointer hover:border-white/20 transition-colors"
            padding="md"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{event.title}</h3>
                <p className="text-xs text-white/60">{event.category || 'Community'}</p>
              </div>
              <AccentBadge label={t('rsvp')} tone="neutral" />
            </div>
            {event.description && <p className="text-sm text-white/70 line-clamp-2">{event.description}</p>}
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
              {event.starts_at && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(event.starts_at).toLocaleString()}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
              {event.max_participants && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event.max_participants} {t('spotsLeft')}
                </span>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Event Detail Sheet */}
      <EventDetailSheet
        event={eventDetail}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        userId={user?.id}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
      />
    </AppShell>
  );
};

const LoadingCard = () => (
  <GlassCard className="h-32 animate-pulse bg-white/5" padding="md">
    <div className="h-4 w-1/2 rounded bg-white/10" />
  </GlassCard>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <GlassCard className="border-dashed border-white/15" padding="lg">
    <p className="text-sm text-white/60">{message}</p>
  </GlassCard>
);
