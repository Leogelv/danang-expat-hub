'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { Check, Star, XCircle } from 'lucide-react';

type RsvpStatus = 'going' | 'interested' | 'not_going';

export interface RsvpButtonProps {
  eventId: string;
  userId: string;
  currentStatus?: RsvpStatus | null;
  onStatusChange?: (status: RsvpStatus) => void;
}

// Кнопка RSVP для событий — 3 состояния
export const RsvpButton: React.FC<RsvpButtonProps> = ({
  eventId,
  userId,
  currentStatus = null,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<RsvpStatus | null>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  // Обработчик смены статуса
  const handleClick = async (newStatus: RsvpStatus) => {
    if (isLoading) return;

    // Повторный клик по текущему статусу — отмена (устанавливаем not_going)
    const targetStatus = status === newStatus ? 'not_going' : newStatus;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, status: targetStatus }),
      });

      if (response.ok) {
        setStatus(targetStatus);
        onStatusChange?.(targetStatus);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const buttons: { key: RsvpStatus; icon: React.ReactNode; label: string }[] = [
    { key: 'going', icon: <Check className="w-4 h-4" />, label: 'Going' },
    { key: 'interested', icon: <Star className="w-4 h-4" />, label: 'Interested' },
    { key: 'not_going', icon: <XCircle className="w-4 h-4" />, label: 'Can\'t go' },
  ];

  return (
    <div className="flex gap-2">
      {buttons.map((btn) => (
        <button
          key={btn.key}
          type="button"
          onClick={() => handleClick(btn.key)}
          disabled={isLoading}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors',
            'border disabled:opacity-50',
            status === btn.key
              ? btn.key === 'going'
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : btn.key === 'interested'
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                : 'bg-red-500/20 border-red-400/40 text-red-300'
              : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10'
          )}
        >
          {btn.icon}
          <span>{btn.label}</span>
        </button>
      ))}
    </div>
  );
};

RsvpButton.displayName = 'RsvpButton';
