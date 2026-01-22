import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import OpenAI from 'openai';

// Валидные значения
const VALID_TABLES = ['listings', 'market_items', 'places', 'events', 'community_posts'];
const VALID_FIELDS = ['title', 'description', 'body', 'name'];
const VALID_LANGUAGES = ['en', 'ru', 'uk', 'vi'];

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ru: 'Russian',
  uk: 'Ukrainian',
  vi: 'Vietnamese',
};

// Инициализация OpenAI (или OpenRouter)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceTable, sourceId, fieldName, originalText, targetLanguage } = body;

    // Валидация
    if (!sourceTable || !VALID_TABLES.includes(sourceTable)) {
      return NextResponse.json({ error: 'Invalid source_table' }, { status: 400 });
    }
    if (!sourceId) {
      return NextResponse.json({ error: 'source_id is required' }, { status: 400 });
    }
    if (!fieldName || !VALID_FIELDS.includes(fieldName)) {
      return NextResponse.json({ error: 'Invalid field_name' }, { status: 400 });
    }
    if (!targetLanguage || !VALID_LANGUAGES.includes(targetLanguage)) {
      return NextResponse.json({ error: 'Invalid target_language' }, { status: 400 });
    }
    if (!originalText || typeof originalText !== 'string') {
      return NextResponse.json({ error: 'original_text is required' }, { status: 400 });
    }

    // Если целевой язык совпадает с исходным (en) — возвращаем оригинал
    if (targetLanguage === 'en') {
      return NextResponse.json({ translatedText: originalText, fromCache: true });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    // Проверяем кэш
    const { data: cached } = await supabase
      .from('content_translations')
      .select('translated_text')
      .eq('source_table', sourceTable)
      .eq('source_id', sourceId)
      .eq('field_name', fieldName)
      .eq('target_language', targetLanguage)
      .single();

    if (cached?.translated_text) {
      return NextResponse.json({
        translatedText: cached.translated_text,
        fromCache: true,
      });
    }

    // AI-перевод
    const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLangName}. Keep the same tone and style. Only output the translation, nothing else.`,
        },
        {
          role: 'user',
          content: originalText,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim() || originalText;

    // Сохраняем в кэш
    await supabase.from('content_translations').upsert({
      source_table: sourceTable,
      source_id: sourceId,
      field_name: fieldName,
      source_language: 'en',
      target_language: targetLanguage,
      translated_text: translatedText,
    });

    return NextResponse.json({
      translatedText,
      fromCache: false,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
