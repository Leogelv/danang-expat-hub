'use client';

import React, { useMemo } from 'react';
import { Bell, CalendarDays, CheckCircle2, Info, MessageCircle, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { AppShell } from '@/fsd/shared/components/AppShell';
import { useRemoteData } from '@/fsd/shared/hooks/useRemoteData';
import { useAuth } from '@/fsd/app/providers/AuthProvider';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string | null;
  metadata: Record<string, unknown> | null;
  is_read: boolean | null;
  created_at: string | null;
}

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <TriangleAlert className="h-4 w-4" />,
  event: <CalendarDays className="h-4 w-4" />,
  message: <MessageCircle className="h-4 w-4" />,
};

export const NotificationsPage: React.FC = () => {
  const t = useTranslations('notifications');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const url = useMemo(() => {
    if (user?.id) return `/api/notifications?userId=${user.id}`;
    return '/api/notifications';
  }, [user?.id]);

  const { data, isLoading } = useRemoteData<NotificationItem>(url);

  return (
    <AppShell
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      variant="ember"
      action={<AccentBadge label="Live" tone="ember" />}
    >
      <div className="grid gap-3">
        {isLoading && <LoadingCard />}
        {!isLoading && data.length === 0 && (
          <EmptyState message={t('empty')} />
        )}
        {data.map((item) => (
          <GlassCard key={item.id} className="flex items-start gap-3" padding="md">
            <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
              {typeIcons[item.type || 'info'] ?? <Bell className="h-4 w-4" />}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <AccentBadge label={item.type || 'info'} tone="neutral" />
              </div>
              <p className="mt-1 text-sm text-white/70">{item.message}</p>
              <p className="mt-2 text-xs text-white/50">
                {item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now'}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>
    </AppShell>
  );
};

const LoadingCard = () => (
  <GlassCard className="h-24 animate-pulse bg-white/5" padding="md">
    <div className="h-4 w-1/2 rounded bg-white/10" />
  </GlassCard>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <GlassCard className="border-dashed border-white/15" padding="lg">
    <p className="text-sm text-white/60">{message}</p>
  </GlassCard>
);
