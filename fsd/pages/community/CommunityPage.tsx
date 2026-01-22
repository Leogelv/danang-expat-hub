'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { MessageSquare, Tag, MapPin, List, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AccentBadge, GlassCard } from '@/fsd/shared/ui/client';
import { FilterChip } from '@/fsd/shared/ui/client/inputs/FilterChip';
import { AppShell } from '@/fsd/shared/components/AppShell';
import { useRemoteData } from '@/fsd/shared/hooks/useRemoteData';
import { CreatePostModal, type CreatePostData } from '@/fsd/features/community';
import { TranslateButton } from '@/fsd/features/translate';
import { CommunityMap, PostDetailSheet, type CommunityPost, type PostDetail } from '@/fsd/widgets/community';

type ViewMode = 'list' | 'map';

// Популярные теги для фильтра
const POPULAR_TAGS = ['tips', 'housing', 'food', 'work', 'visa', 'question', 'social'];

export const CommunityPage: React.FC = () => {
  const t = useTranslations('community');
  const tCommon = useTranslations('common');

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Загрузка постов с фильтром по тегам
  const tagsParam = selectedTags.length > 0 ? `&tags=${selectedTags.join(',')}` : '';
  const { data, isLoading, refresh } = useRemoteData<CommunityPost>(
    `/api/community?limit=50${tagsParam}`
  );

  // Переключение тега
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Клик по карточке
  const handlePostClick = useCallback((post: CommunityPost) => {
    setSelectedPost(post as PostDetail);
  }, []);

  // Создание поста
  const handleCreatePost = useCallback(
    async (data: CreatePostData) => {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        refresh();
      }
    },
    [refresh]
  );

  // Посты с геолокацией для карты
  const geotaggedPosts = useMemo(
    () => data.filter((p) => p.latitude !== null && p.longitude !== null),
    [data]
  );

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
          {t('newPost')}
        </button>
      }
    >
      {/* Переключатель List/Map */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            {t('listView')}
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            {t('mapView')}
            {geotaggedPosts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-cyan-500/30 text-cyan-300 rounded-full">
                {geotaggedPosts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Фильтры по тегам */}
      <div className="flex flex-wrap gap-2 mb-4">
        {POPULAR_TAGS.map((tag) => (
          <FilterChip
            key={tag}
            label={`#${tag}`}
            selected={selectedTags.includes(tag)}
            onClick={() => toggleTag(tag)}
            size="sm"
          />
        ))}
      </div>

      {/* Контент */}
      {viewMode === 'list' ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {isLoading && <LoadingCard />}
          {!isLoading && data.length === 0 && (
            <EmptyState message={tCommon('empty')} />
          )}
          {data.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => handlePostClick(post)}
            />
          ))}
        </div>
      ) : (
        <div className="h-[60vh] rounded-xl overflow-hidden">
          <CommunityMap
            posts={data}
            onPostClick={handlePostClick}
            selectedPostId={selectedPost?.id}
          />
        </div>
      )}

      {/* Модалка деталей поста */}
      <PostDetailSheet
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />

      {/* Модалка создания поста */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </AppShell>
  );
};

// Карточка поста
interface PostCardProps {
  post: CommunityPost;
  onClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const t = useTranslations('community');
  const [displayTitle, setDisplayTitle] = useState(post.title);

  return (
    <GlassCard
      className="flex h-full flex-col gap-3 cursor-pointer hover:border-white/20 transition-colors"
      padding="md"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white truncate">{displayTitle}</h3>
            <TranslateButton
              sourceTable="community_posts"
              sourceId={post.id}
              fieldName="title"
              originalText={post.title}
              onTranslated={setDisplayTitle}
            />
          </div>
          <p className="text-xs text-white/60">{post.author_name || 'Anonymous'}</p>
        </div>
        {post.latitude && post.longitude && (
          <span className="flex items-center gap-1 text-xs text-cyan-400">
            <MapPin className="w-3 h-3" />
            {t('geotagged')}
          </span>
        )}
      </div>

      <p className="text-sm text-white/70 line-clamp-2">{post.body}</p>

      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 mt-auto">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Today'}
        </span>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="text-[10px] text-white/40">+{post.tags.length - 3}</span>
          )}
        </div>
      )}
    </GlassCard>
  );
};

const LoadingCard = () => (
  <GlassCard className="h-32 animate-pulse bg-white/5" padding="md">
    <div className="h-4 w-1/2 rounded bg-white/10" />
  </GlassCard>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <GlassCard className="border-dashed border-white/15 col-span-full" padding="lg">
    <p className="text-sm text-white/60 text-center">{message}</p>
  </GlassCard>
);
