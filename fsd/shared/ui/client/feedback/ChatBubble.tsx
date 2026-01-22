import React from 'react';
import clsx from 'clsx';

export interface ChatBubbleProps {
  variant?: 'user' | 'assistant' | 'tool';
  className?: string;
  children: React.ReactNode;
}

const variants: Record<NonNullable<ChatBubbleProps['variant']>, string> = {
  user: 'bg-gradient-to-br from-white/15 to-white/5 text-white border-white/10 ml-auto',
  assistant: 'bg-slate-900/70 text-white border-white/10 mr-auto',
  tool: 'bg-slate-800/80 text-white/90 border-emerald-500/30 mr-auto',
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  variant = 'assistant',
  className,
  children,
}) => (
  <div
    className={clsx(
      'max-w-[85%] rounded-3xl border px-4 py-3 text-sm leading-relaxed shadow-[0_12px_30px_rgba(15,23,42,0.45)]',
      variants[variant],
      className,
    )}
  >
    {children}
  </div>
);
