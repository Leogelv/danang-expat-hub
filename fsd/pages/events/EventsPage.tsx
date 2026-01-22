'use client';

import React from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { AppShell } from '@/fsd/shared/components/AppShell';
import { useRemoteData } from '@/fsd/shared/hooks/useRemoteData';

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  location: string | null;
  category: string | null;
  max_participants: number | null;
  organizer_contact: string | null;
}

export const EventsPage: React.FC = () => {
  const { data, isLoading } = useRemoteData<EventItem>('/api/events');

  return (
    <AppShell
      eyebrow="Events"
      title="Meetup calendar"
      description="Sports, networking, and local meetups to build your expat circle."
      variant="aurora"
      action={<AccentBadge label="Upcoming" tone="aurora" />}
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {isLoading && <LoadingCard />}
        {!isLoading && data.length === 0 && (
          <EmptyState message="No events yet. Check back soon or create one in the community." />
        )}
        {data.map((event) => (
          <GlassCard key={event.id} className="flex h-full flex-col gap-3" padding="md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{event.title}</h3>
                <p className="text-xs text-white/60">{event.category || 'Community'}</p>
              </div>
              <AccentBadge label="RSVP" tone="neutral" />
            </div>
            {event.description && <p className="text-sm text-white/70">{event.description}</p>}
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
                  {event.max_participants} spots
                </span>
              )}
            </div>
            {event.organizer_contact && (
              <div className="text-xs text-white/60">Contact: {event.organizer_contact}</div>
            )}
          </GlassCard>
        ))}
      </div>
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
