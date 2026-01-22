'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

export interface ImageCarouselProps {
  images: string[];
  alt?: string;
  aspectRatio?: 'square' | '4/3' | '16/9' | '3/4';
  className?: string;
  showIndicators?: boolean;
  fallbackSrc?: string;
}

const aspectRatioStyles: Record<NonNullable<ImageCarouselProps['aspectRatio']>, string> = {
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-video',
  '3/4': 'aspect-[3/4]',
};

// Плейсхолдер если нет изображений
const FALLBACK_IMAGE = '/placeholder-image.svg';

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  alt = 'Image',
  aspectRatio = '4/3',
  className,
  showIndicators = true,
  fallbackSrc = FALLBACK_IMAGE,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Фильтруем пустые URL и добавляем fallback если нужно
  const validImages = images.filter((img) => img && img.trim() !== '');
  const displayImages = validImages.length > 0 ? validImages : [fallbackSrc];

  // Обработчик скролла для определения активного слайда
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < displayImages.length) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex, displayImages.length]);

  // Обработчик ошибки загрузки изображения
  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  // Скролл к конкретному слайду
  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.offsetWidth;
    scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
  };

  // Если только одно изображение — без карусели
  if (displayImages.length === 1) {
    return (
      <div className={clsx('relative overflow-hidden rounded-xl', aspectRatioStyles[aspectRatio], className)}>
        <Image
          src={imageErrors.has(0) ? fallbackSrc : displayImages[0]}
          alt={alt}
          fill
          className="object-cover"
          onError={() => handleImageError(0)}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <div className={clsx('relative', className)}>
      {/* Scroll-snap контейнер */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={clsx(
          'flex snap-x snap-mandatory overflow-x-auto scrollbar-hide rounded-xl',
          aspectRatioStyles[aspectRatio]
        )}
        style={{ scrollBehavior: 'smooth' }}
      >
        {displayImages.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="relative flex-shrink-0 w-full snap-center"
            style={{ aspectRatio: aspectRatio === 'square' ? '1/1' : aspectRatio }}
          >
            <Image
              src={imageErrors.has(index) ? fallbackSrc : src}
              alt={`${alt} ${index + 1}`}
              fill
              className="object-cover"
              onError={() => handleImageError(index)}
              sizes="(max-width: 768px) 100vw, 50vw"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Индикаторы-точки */}
      {showIndicators && displayImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {displayImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              className={clsx(
                'w-1.5 h-1.5 rounded-full transition-all duration-200',
                index === activeIndex
                  ? 'bg-white w-3'
                  : 'bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Счётчик изображений (альтернатива точкам для много фото) */}
      {displayImages.length > 5 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
          {activeIndex + 1}/{displayImages.length}
        </div>
      )}
    </div>
  );
};

ImageCarousel.displayName = 'ImageCarousel';
