'use client';

import React, { useMemo } from 'react';
import { Mail, MapPin, User, UserCircle2 } from 'lucide-react';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { AppShell } from '@/fsd/shared/components/AppShell';
import { useAuth } from '@/fsd/app/providers/AuthProvider';
import { useRemoteData } from '@/fsd/shared/hooks/useRemoteData';

interface FavoriteItem {
  id: string;
  source: string;
  title: string;
  description: string | null;
  location: string | null;
  price: number | null;
  contact: string | null;
}

export const ProfilePage: React.FC = () => {
  const { user, status } = useAuth();
  const favoritesUrl = useMemo(() => {
    if (!user?.id) return '';
    return `/api/favorites?userId=${user.id}`;
  }, [user?.id]);

  const { data: favorites, isLoading } = useRemoteData<FavoriteItem>(favoritesUrl);

  return (
    <AppShell
      eyebrow="Profile"
      title={user?.first_name ? `${user.first_name}'s space` : 'Your profile'}
      description="Your Telegram identity, preferences, and saved items."
      variant="midnight"
      action={<AccentBadge label={status === 'authenticated' ? 'Signed in' : 'Guest'} tone="neutral" />}
    >
      <GlassCard className="flex flex-col gap-4" padding="lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            {user?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photo_url} alt="User avatar" className="h-full w-full object-cover" />
            ) : (
              <UserCircle2 className="h-12 w-12 text-white/60" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Telegram User'}
            </h3>
            <p className="text-sm text-white/60">@{user?.username || 'no-username'}</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <InfoRow icon={<User className="h-4 w-4" />} label="Telegram ID" value={user?.telegram_id ? String(user.telegram_id) : '—'} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="User ID" value={user?.id || '—'} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Timezone" value={user?.timezone || 'UTC'} />
        </div>
      </GlassCard>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Favorites</h3>
            <p className="text-sm text-white/60">Saved listings, places, and events.</p>
          </div>
          <AccentBadge label={`${favorites.length}`} tone="neutral" />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {isLoading && <LoadingCard />}
          {!isLoading && favorites.length === 0 && (
            <EmptyState message="No favorites yet. Save listings or ask the AI to add items here." />
          )}
          {favorites.map((item) => (
            <GlassCard key={`${item.source}-${item.id}`} className="flex h-full flex-col gap-3" padding="md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-white/60">{item.source}</p>
                </div>
                <AccentBadge label="Saved" tone="neutral" />
              </div>
              {item.description && <p className="text-sm text-white/70">{item.description}</p>}
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                {item.location && <span>{item.location}</span>}
                {item.price ? <span>${item.price}</span> : null}
                {item.contact ? <span>{item.contact}</span> : null}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/70">
      {icon}
    </span>
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">{label}</div>
      <div className="text-sm text-white/90 break-all">{value}</div>
    </div>
  </div>
);

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
