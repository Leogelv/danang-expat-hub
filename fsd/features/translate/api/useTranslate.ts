'use client';

import { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';

export type SourceTable = 'listings' | 'market_items' | 'places' | 'events' | 'community_posts';
export type FieldName = 'title' | 'description' | 'body' | 'name';

export interface TranslateRequest {
  sourceTable: SourceTable;
  sourceId: string;
  fieldName: FieldName;
  originalText: string;
}

export interface TranslateResult {
  translatedText: string;
  fromCache: boolean;
}

export interface UseTranslateResult {
  translate: (request: TranslateRequest) => Promise<TranslateResult | null>;
  isLoading: boolean;
  error: string | null;
}

// Хук для AI-перевода контента с кэшированием
export function useTranslate(): UseTranslateResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  const translate = useCallback(
    async (request: TranslateRequest): Promise<TranslateResult | null> => {
      // Если текущий язык английский — не переводим (исходный контент на en)
      if (locale === 'en') {
        return { translatedText: request.originalText, fromCache: true };
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceTable: request.sourceTable,
            sourceId: request.sourceId,
            fieldName: request.fieldName,
            originalText: request.originalText,
            targetLanguage: locale,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Translation failed');
        }

        const data = await response.json();
        return {
          translatedText: data.translatedText,
          fromCache: data.fromCache ?? false,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Translation failed';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [locale]
  );

  return { translate, isLoading, error };
}
