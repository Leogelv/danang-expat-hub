import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
const baseURL = process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined;
const model = process.env.OPENAI_MODEL || process.env.OPENROUTER_MODEL || 'gpt-4o-mini';

const systemPrompt = `You are the Danang Expat Hub assistant inside a Telegram mini app.\n\nGoals:\n- Answer quickly with curated, practical recommendations.\n- Ask short clarifying questions when needed (budget, location, dates).\n- Use the search_supabase tool to find listings, market items, places, events, and community posts.\n- Summarize results with price, location, and contact when available.\n- If nothing matches, suggest the closest alternatives and ask to refine the request.\n\nKeep replies short, friendly, and action oriented.`;

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_supabase',
      description: 'Search the Danang Expat Hub database for listings, market items, places, events, and community posts.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search phrase, in English or Russian.' },
          category: { type: 'string', description: 'Optional category filter, e.g. housing, bike, Cafe, Networking.' },
          source: { type: 'string', description: 'Optional source filter: listing, market, place, event, post.' },
          limit: { type: 'number', description: 'Max results, 1-10.' },
        },
        required: ['query'],
      },
    },
  },
];

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function searchSupabase(args: {
  query: string;
  category?: string;
  source?: string;
  limit?: number;
}) {
  const supabase = getSupabaseServer({ serviceRole: true });
  const safeLimit = Math.min(Math.max(args.limit ?? 5, 1), 10);

  let dbQuery = supabase
    .from('search_items')
    .select('*')
    .limit(safeLimit)
    .order('created_at', { ascending: false });

  if (args.category) {
    dbQuery = dbQuery.eq('category', args.category);
  }

  if (args.source) {
    dbQuery = dbQuery.eq('source', args.source);
  }

  const like = `%${args.query}%`;
  dbQuery = dbQuery.or(`title.ilike.${like},description.ilike.${like},location.ilike.${like}`);

  const { data, error } = await dbQuery;
  if (error) {
    return { error: error.message, results: [] };
  }

  return { results: data ?? [] };
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({
        message: 'AI is not configured. Set OPENAI_API_KEY or OPENROUTER_API_KEY to enable assistant replies.',
        toolCalls: [],
      });
    }

    const client = new OpenAI({ apiKey, baseURL });

    const baseMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const first = await client.chat.completions.create({
      model,
      messages: baseMessages,
      tools,
      tool_choice: 'auto',
    });

    const assistantMessage = first.choices[0]?.message;
    if (!assistantMessage) {
      return NextResponse.json({ message: 'No response from AI', toolCalls: [] });
    }

    if (!assistantMessage.tool_calls?.length) {
      return NextResponse.json({ message: assistantMessage.content ?? '', toolCalls: [] });
    }

    const toolCallsSummary = [] as Array<{
      name: string;
      args: Record<string, unknown>;
      result: unknown;
    }>;

    const followupMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...baseMessages,
      assistantMessage,
    ];

    for (const call of assistantMessage.tool_calls) {
      if (call.function?.name !== 'search_supabase') continue;

      const args = safeJsonParse(call.function.arguments) ?? { query: '' };
      const result = await searchSupabase({
        query: String(args.query || ''),
        category: typeof args.category === 'string' ? args.category : undefined,
        source: typeof args.source === 'string' ? args.source : undefined,
        limit: typeof args.limit === 'number' ? args.limit : undefined,
      });

      toolCallsSummary.push({
        name: call.function.name,
        args,
        result,
      });

      followupMessages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }

    const second = await client.chat.completions.create({
      model,
      messages: followupMessages,
    });

    const finalMessage = second.choices[0]?.message?.content ?? '';

    return NextResponse.json({
      message: finalMessage,
      toolCalls: toolCallsSummary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
