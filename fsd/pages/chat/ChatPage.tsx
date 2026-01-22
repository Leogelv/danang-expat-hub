'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { AppScreen, AccentBadge, ActionButton, ChatBubble, GlassCard, SectionHeader } from '@/fsd/shared/ui/client';
import { BottomNav } from '@/fsd/shared/components/BottomNav';
import { useAuth } from '@/fsd/app/providers/AuthProvider';

interface ToolCallSummary {
  name: string;
  args: Record<string, unknown>;
  result: {
    results?: Array<{
      id: string;
      source: string;
      category: string | null;
      title: string;
      description: string | null;
      price: number | null;
      location: string | null;
      contact: string | null;
      metadata?: Record<string, unknown>;
    }>;
    error?: string;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCallSummary[];
}

const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi! I can find housing, bikes, places, events, and market deals in Danang. What are you looking for?'
};

function buildApiMessages(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.role !== 'tool')
    .map((message) => ({ role: message.role, content: message.content }));
}

export const ChatPage: React.FC = () => {
  const { user, status, error, refresh } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const historyForApi = useMemo(() => buildApiMessages(messages), [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const nextMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, nextMessage]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...historyForApi, { role: 'user', content: nextMessage.content }],
          userId: user?.id ?? null,
        }),
      });

      const payload = await response.json();
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: payload.message ?? 'Sorry, I did not get that. Try again.',
      };

      const toolMessages: ChatMessage[] = (payload.toolCalls || []).map((toolCall: ToolCallSummary) => ({
        id: crypto.randomUUID(),
        role: 'tool',
        content: toolCall.name,
        toolCalls: [toolCall],
      }));

      setMessages((prev) => [...prev, ...toolMessages, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: err instanceof Error ? err.message : 'Something went wrong.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppScreen variant="midnight" contentClassName="gap-5" withBottomMenu>
      <SectionHeader
        eyebrow="AI Assistant"
        title="Ask about Danang"
        description="Search housing, bikes, places, events, and the expat market."
        action={<AccentBadge label={status === 'authenticated' ? 'Online' : 'Guest'} tone="ember" />}
      />

      <GlassCard className="flex flex-1 flex-col gap-4 overflow-hidden" padding="lg">
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide chat-messages-scroll">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-3">
              {message.role === 'tool' && message.toolCalls ? (
                message.toolCalls.map((toolCall) => (
                  <ToolCallPanel key={toolCall.name} toolCall={toolCall} />
                ))
              ) : (
                <ChatBubble variant={message.role === 'user' ? 'user' : 'assistant'}>
                  {message.content}
                </ChatBubble>
              )}
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          {status === 'error' && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
              {error || 'Authentication failed. Try again.'}
            </div>
          )}
          {status === 'unauthenticated' && (
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/80">
              Open the mini app inside Telegram to unlock full AI features.
            </div>
          )}
          <div className="flex flex-col gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={2}
              placeholder="Ask about housing, bikes, cafes, events..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => refresh()}
                className="text-xs text-white/50 hover:text-white"
              >
                Refresh session
              </button>
              <ActionButton onClick={sendMessage} disabled={!input.trim() || isSending}>
                <Sparkles className="h-4 w-4" />
                Ask AI
              </ActionButton>
            </div>
          </div>
        </div>
      </GlassCard>
      <BottomNav />
    </AppScreen>
  );
};

const ToolCallPanel: React.FC<{ toolCall: ToolCallSummary }> = ({ toolCall }) => {
  const results = toolCall.result?.results ?? [];
  const error = toolCall.result?.error;

  return (
    <GlassCard className="space-y-3" padding="md">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
        <span>Tool</span>
        <span>{toolCall.name}</span>
      </div>
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/15 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      )}
      {results.length === 0 ? (
        <div className="text-sm text-white/70">No matches yet. Try a new location or budget.</div>
      ) : (
        <div className="space-y-3">
          {results.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-white">{item.title}</div>
                <AccentBadge label={item.source} />
              </div>
              <div className="mt-1 text-xs text-white/60">
                {item.category ? `${item.category} · ` : ''}
                {item.location || 'Danang'}
              </div>
              {item.description && (
                <p className="mt-2 text-xs text-white/70">{item.description}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/70">
                {item.price ? <span>Price: ${item.price}</span> : null}
                {item.contact ? <span>Contact: {item.contact}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};
