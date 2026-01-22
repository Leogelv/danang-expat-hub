import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { AI_TOOLS, type ToolName } from '@/fsd/shared/lib/ai/tools';
import { executeTool } from '@/fsd/shared/lib/ai/executor';

// API клиент (поддерживает OpenAI и OpenRouter)
const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
const baseURL = process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined;

// Загрузка конфига агента из БД или fallback
async function getAgentConfig() {
  try {
    const supabase = getSupabaseServer({ serviceRole: true });
    const { data } = await supabase
      .from('ai_agent_config')
      .select('*')
      .eq('name', 'default')
      .single();

    if (data) return data;
  } catch (e) {
    console.warn('[assistant] Failed to load config from DB, using fallback', e);
  }

  // Fallback конфиг
  return {
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    temperature: 0.7,
    max_tokens: 2048,
    system_prompt: `You are a helpful AI assistant for Danang Expat Hub - a Telegram Mini App for expats in Da Nang, Vietnam.

Your capabilities:
- Search rentals (apartments, houses, rooms)
- Search places (cafes, restaurants, coworkings, gyms)
- Search market items (buy/sell goods)
- Search events
- Help users with their favorites
- Create community posts

Always respond in the same language as the user's message.
Be concise and helpful. When showing search results, format them nicely with emojis.
If user asks about something you can search for, use the appropriate tool.

Location context: Da Nang, Vietnam - a coastal city popular with digital nomads and expats.`,
    tools_enabled: ['search_listings', 'search_places', 'search_market', 'search_events', 'get_user_favorites', 'create_community_post', 'get_community_posts'],
  };
}

// Сохранение сообщения в историю
async function saveMessage(
  conversationId: string,
  role: string,
  content: string | null,
  toolCalls?: unknown,
  toolCallId?: string,
  name?: string
) {
  try {
    const supabase = getSupabaseServer({ serviceRole: true });
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role,
      content,
      tool_calls: toolCalls || null,
      tool_call_id: toolCallId || null,
      name: name || null,
    });
  } catch (e) {
    console.warn('[assistant] Failed to save message', e);
  }
}

// Получение или создание разговора
async function getOrCreateConversation(userId?: string, telegramId?: number) {
  const supabase = getSupabaseServer({ serviceRole: true });

  // Ищем активный разговор
  let query = supabase
    .from('ai_conversations')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (telegramId) {
    query = query.eq('telegram_id', telegramId);
  } else {
    // Без идентификации - создаём новый каждый раз
    const { data: newConv } = await supabase
      .from('ai_conversations')
      .insert({ metadata: { anonymous: true } })
      .select('id')
      .single();
    return newConv?.id;
  }

  const { data: existing } = await query;
  if (existing?.[0]?.id) {
    // Обновляем updated_at
    await supabase
      .from('ai_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', existing[0].id);
    return existing[0].id;
  }

  // Создаём новый
  const { data: newConv } = await supabase
    .from('ai_conversations')
    .insert({
      user_id: userId || null,
      telegram_id: telegramId || null,
    })
    .select('id')
    .single();

  return newConv?.id;
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userId, telegramId } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({
        message: 'AI is not configured. Set OPENAI_API_KEY or OPENROUTER_API_KEY.',
        toolCalls: [],
      });
    }

    // Загружаем конфиг агента
    const config = await getAgentConfig();
    const client = new OpenAI({ apiKey, baseURL });

    // Получаем/создаём разговор для истории
    const conversationId = await getOrCreateConversation(userId, telegramId);

    // Фильтруем инструменты по конфигу
    const enabledTools = AI_TOOLS.filter((t) =>
      config.tools_enabled?.includes(t.function.name)
    );

    // Формируем сообщения для API
    const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: config.system_prompt },
      ...messages,
    ];

    // Сохраняем последнее сообщение пользователя
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user' && conversationId) {
      await saveMessage(conversationId, 'user', lastUserMessage.content);
    }

    // Первый запрос к AI
    const firstResponse = await client.chat.completions.create({
      model: config.model,
      messages: apiMessages,
      tools: enabledTools.length > 0 ? enabledTools : undefined,
      tool_choice: enabledTools.length > 0 ? 'auto' : undefined,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
    });

    const assistantMessage = firstResponse.choices[0]?.message;
    if (!assistantMessage) {
      return NextResponse.json({ message: 'No response from AI', toolCalls: [] });
    }

    // Если нет tool calls - возвращаем ответ
    if (!assistantMessage.tool_calls?.length) {
      const content = assistantMessage.content ?? '';

      // Сохраняем ответ
      if (conversationId) {
        await saveMessage(conversationId, 'assistant', content);
      }

      return NextResponse.json({ message: content, toolCalls: [] });
    }

    // Есть tool calls - выполняем их
    const toolCallsSummary: Array<{
      name: string;
      args: Record<string, unknown>;
      result: unknown;
    }> = [];

    const followupMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...apiMessages,
      assistantMessage,
    ];

    // Контекст для выполнения инструментов
    const executorContext = {
      userId,
      telegramId,
    };

    // Выполняем каждый tool call
    for (const call of assistantMessage.tool_calls) {
      if (call.type !== 'function') continue;

      const fn = call.function;
      const toolName = fn.name as ToolName;
      const args = safeJsonParse(fn.arguments);

      console.log(`[assistant] Executing tool: ${toolName}`, args);

      // Выполняем инструмент
      const result = await executeTool(toolName, args, executorContext);

      toolCallsSummary.push({
        name: toolName,
        args,
        result: result.data ?? result.error,
      });

      // Добавляем результат для follow-up
      followupMessages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });

      // Сохраняем tool call и результат
      if (conversationId) {
        await saveMessage(conversationId, 'assistant', null, [call]);
        await saveMessage(conversationId, 'tool', JSON.stringify(result), null, call.id, toolName);
      }
    }

    // Второй запрос к AI с результатами инструментов
    const secondResponse = await client.chat.completions.create({
      model: config.model,
      messages: followupMessages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
    });

    const finalContent = secondResponse.choices[0]?.message?.content ?? '';

    // Сохраняем финальный ответ
    if (conversationId) {
      await saveMessage(conversationId, 'assistant', finalContent);
    }

    return NextResponse.json({
      message: finalContent,
      toolCalls: toolCallsSummary,
      conversationId,
    });
  } catch (error) {
    console.error('[assistant] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}
