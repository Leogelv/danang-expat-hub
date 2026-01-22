-- AI Agent: таблицы для хранения конфига, разговоров и сообщений

-- Конфигурация агента (системный промпт, модель, температура)
CREATE TABLE IF NOT EXISTS public.ai_agent_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE DEFAULT 'default',
  system_prompt text NOT NULL,
  model text NOT NULL DEFAULT 'gpt-4o',
  temperature double precision DEFAULT 0.7,
  max_tokens integer DEFAULT 2048,
  tools_enabled text[] DEFAULT ARRAY['search_listings', 'search_places', 'search_market', 'search_events', 'get_user_favorites', 'create_community_post'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Разговоры (сессии чата)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id bigint,
  title text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Сообщения в разговоре
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content text,
  tool_calls jsonb,
  tool_call_id text,
  name text,
  created_at timestamptz DEFAULT now()
);

-- Индексы
CREATE INDEX IF NOT EXISTS ai_conversations_user_idx ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS ai_conversations_telegram_idx ON public.ai_conversations(telegram_id);
CREATE INDEX IF NOT EXISTS ai_messages_conversation_idx ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS ai_messages_created_idx ON public.ai_messages(created_at);

-- Дефолтный конфиг агента для Danang Expat Hub
INSERT INTO public.ai_agent_config (name, system_prompt, model, temperature) VALUES (
  'default',
  'You are a helpful AI assistant for Danang Expat Hub - a Telegram Mini App for expats in Da Nang, Vietnam.

Your capabilities:
- Search rentals (apartments, houses, rooms)
- Search places (cafes, restaurants, coworkings, gyms)
- Search market items (buy/sell goods)
- Search events
- Help users with their favorites
- Create community posts

Always respond in the same language as the user''s message.
Be concise and helpful. When showing search results, format them nicely.
If user asks about something you can search for, use the appropriate tool.

Location context: Da Nang, Vietnam - a coastal city popular with digital nomads and expats.',
  'gpt-4o',
  0.7
) ON CONFLICT (name) DO UPDATE SET
  system_prompt = EXCLUDED.system_prompt,
  updated_at = now();

-- RLS политики
ALTER TABLE public.ai_agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Config: только чтение для всех
CREATE POLICY "ai_agent_config_read" ON public.ai_agent_config
  FOR SELECT USING (true);

-- Conversations: юзер видит только свои
CREATE POLICY "ai_conversations_own" ON public.ai_conversations
  FOR ALL USING (
    user_id = auth.uid() OR
    telegram_id IN (SELECT telegram_id FROM public.tg_users WHERE id = auth.uid())
  );

-- Messages: юзер видит сообщения своих разговоров
CREATE POLICY "ai_messages_own" ON public.ai_messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.ai_conversations
      WHERE user_id = auth.uid() OR
            telegram_id IN (SELECT telegram_id FROM public.tg_users WHERE id = auth.uid())
    )
  );
