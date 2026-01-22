'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';

export interface Comment {
  id: string;
  author_name: string | null;
  body: string;
  created_at: string;
}

export interface CommentThreadProps {
  postId: string;
  comments: Comment[];
  onAddComment?: (body: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

// Тред комментариев к посту
export const CommentThread: React.FC<CommentThreadProps> = ({
  postId,
  comments,
  onAddComment,
  isLoading = false,
  className,
}) => {
  const t = useTranslations('community');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Заголовок */}
      <h4 className="text-sm font-semibold text-white/80">
        {t('comments')} ({comments.length})
      </h4>

      {/* Список комментариев */}
      {comments.length === 0 ? (
        <p className="text-sm text-white/40 italic">{t('noComments')}</p>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-white/90">
                  {comment.author_name || 'Anonymous'}
                </span>
                <span className="text-xs text-white/40">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-white/70 whitespace-pre-wrap">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Форма добавления комментария */}
      {onAddComment && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('addComment')}
            disabled={isSubmitting}
            className={clsx(
              'flex-1 px-3 py-2 rounded-xl text-sm',
              'bg-white/5 border border-white/15 text-white placeholder-white/40',
              'focus:outline-none focus:border-cyan-500/50',
              'disabled:opacity-50'
            )}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              'bg-cyan-500 text-white',
              'hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isSubmitting ? '...' : t('send') || 'Send'}
          </button>
        </form>
      )}
    </div>
  );
};

CommentThread.displayName = 'CommentThread';
