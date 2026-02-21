'use client';

import React, { useEffect } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow, format } from 'date-fns';
import { X, MapPin, Clock, Users, DollarSign, Calendar } from 'lucide-react';
import { RsvpButton } from '@/fsd/features/events/rsvp';

export interface EventDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  price: number | null;
  max_participants: number | null;
  organizer_contact: string | null;
  attendees_count?: number;
  created_at: string;
}

export interface EventDetailSheetProps {
  event: EventDetail | null;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

// Bottom sheet с деталями события
export const EventDetailSheet: React.FC<EventDetailSheetProps> = ({
  event,
  isOpen,
  onClose,
  userId,
}) => {
  const t = useTranslations('events');

  // Блокируем скролл body при открытом шите
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

  if (!isOpen || !event) return null;

  // Форматирование даты события
  const startDate = new Date(event.starts_at);
  const formattedDate = format(startDate, 'EEEE, MMM d');
  const formattedTime = format(startDate, 'h:mm a');
  const endTime = event.ends_at ? format(new Date(event.ends_at), 'h:mm a') : null;
  const timeAgo = formatDistanceToNow(new Date(event.created_at), { addSuffix: true });

  // Цвет бейджа категории
  const categoryColors: Record<string, string> = {
    social: 'bg-blue-500/20 text-blue-300',
    sports: 'bg-emerald-500/20 text-emerald-300',
    business: 'bg-purple-500/20 text-purple-300',
    culture: 'bg-amber-500/20 text-amber-300',
    party: 'bg-pink-500/20 text-pink-300',
    other: 'bg-white/10 text-white/70',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={clsx(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-slate-900 border-t border-white/10 rounded-t-3xl',
          'max-h-[80vh] overflow-hidden',
          'animate-in slide-in-from-bottom duration-300'
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-5 pb-6 overflow-y-auto max-h-[calc(80vh-60px)]">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={clsx(
                  'px-2 py-0.5 text-xs rounded-full font-medium',
                  categoryColors[event.category] || categoryColors.other
                )}>
                  {event.category}
                </span>
                <span className="text-xs text-white/40">{timeAgo}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{event.title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info cards — дата, время, место */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <Calendar className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">{formattedDate}</p>
                <p className="text-xs text-white/50">
                  {formattedTime}
                  {endTime ? ` — ${endTime}` : ''}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
                <p className="text-sm text-white">{event.location}</p>
              </div>
            )}

            <div className="flex gap-2">
              {event.price != null && event.price > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl flex-1">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-white">${event.price}</span>
                </div>
              )}
              {event.price === 0 || event.price == null ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-xl flex-1">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300 font-medium">{t('free')}</span>
                </div>
              ) : null}
              {event.max_participants && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl flex-1">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-white">
                    {event.attendees_count ?? 0}/{event.max_participants}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-5">
            <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Organizer Contact */}
          {event.organizer_contact && (
            <div className="mb-5 p-3 bg-white/5 rounded-xl">
              <p className="text-xs text-white/40 mb-1">{t('organizer')}</p>
              <p className="text-sm text-cyan-300">{event.organizer_contact}</p>
            </div>
          )}

          {/* RSVP кнопки */}
          {userId && (
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-white/40 mb-3">{t('areYouGoing')}</p>
              <RsvpButton
                eventId={event.id}
                userId={userId}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

EventDetailSheet.displayName = 'EventDetailSheet';
