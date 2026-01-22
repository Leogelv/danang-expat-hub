'use client';

import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { CommentThread, type Comment } from '@/fsd/features/community';
import { TranslateButton } from '@/fsd/features/translate';

export interface PostDetail {
  id: string;
  title: string;
  body: string;
  author_name: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  created_at: string;
}

export interface PostDetailSheetProps {
  post: PostDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

// Bottom sheet с деталями поста и комментариями
export const PostDetailSheet: React.FC<PostDetailSheetProps> = ({
  post,
  isOpen,
  onClose,
}) => {
  const t = useTranslations('community');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [displayTitle, setDisplayTitle] = useState('');
  const [displayBody, setDisplayBody] = useState('');

  // Синхронизируем display текст с оригиналом при смене поста
  useEffect(() => {
    if (post) {
      setDisplayTitle(post.title);
      setDisplayBody(post.body);
    }
  }, [post]);

  // Загружаем комментарии при открытии
  useEffect(() => {
    if (isOpen && post) {
      loadComments();
    }
  }, [isOpen, post?.id]);

  const loadComments = async () => {
    if (!post) return;
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/community/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch {
      // Игнорируем ошибки
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Добавление комментария
  const handleAddComment = useCallback(
    async (body: string) => {
      if (!post) return;
      const response = await fetch(`/api/community/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [...prev, data.comment]);
      }
    },
    [post]
  );

  // Блокируем скролл body
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

  if (!isOpen || !post) return null;

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
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white">{displayTitle}</h3>
                <TranslateButton
                  sourceTable="community_posts"
                  sourceId={post.id}
                  fieldName="title"
                  originalText={post.title}
                  onTranslated={setDisplayTitle}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span>{post.author_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                {post.latitude && post.longitude && (
                  <>
                    <span>•</span>
                    <span className="text-cyan-400">{t('geotagged')}</span>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/50 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-white/10 text-white/70 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="mb-6">
            <div className="flex items-start gap-2">
              <p className="text-sm text-white/80 whitespace-pre-wrap flex-1">
                {displayBody}
              </p>
              <TranslateButton
                sourceTable="community_posts"
                sourceId={post.id}
                fieldName="body"
                originalText={post.body}
                onTranslated={setDisplayBody}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-4">
            {/* Comments */}
            <CommentThread
              postId={post.id}
              comments={comments}
              onAddComment={handleAddComment}
              isLoading={isLoadingComments}
            />
          </div>
        </div>
      </div>
    </>
  );
};

PostDetailSheet.displayName = 'PostDetailSheet';
