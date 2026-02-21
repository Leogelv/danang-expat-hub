import { vi } from 'vitest';

// Chainable query builder мок
export function createMockQueryBuilder(responseData: unknown = [], responseError: unknown = null) {
  const builder: Record<string, any> = {};

  // Все chainable методы
  const chainMethods = [
    'from', 'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
    'is', 'in', 'not', 'or', 'and',
    'order', 'limit', 'range', 'overlaps',
    'match', 'textSearch', 'filter', 'contains',
  ];

  chainMethods.forEach(method => {
    builder[method] = vi.fn().mockReturnValue(builder);
  });

  // Terminal methods — возвращают результат
  builder.single = vi.fn().mockResolvedValue({ data: responseData, error: responseError });
  builder.maybeSingle = vi.fn().mockResolvedValue({ data: responseData, error: responseError });
  builder.then = undefined; // Убираем thenable поведение для цепочки

  // Переопределяем chainable методы чтобы финальный await возвращал результат
  const originalSelect = builder.select;

  // Делаем builder awaitable — когда вызывается без .single()
  const makeAwaitable = () => {
    const promise = Promise.resolve({ data: responseData, error: responseError });
    Object.keys(builder).forEach(key => {
      if (typeof builder[key] === 'function') {
        (promise as any)[key] = builder[key];
      }
    });
    return promise;
  };

  // Переопределяем все chain methods чтобы возвращать awaitable builder
  chainMethods.forEach(method => {
    builder[method] = vi.fn().mockImplementation(() => {
      const result = makeAwaitable();
      // Добавляем chain methods на результат (включая single/maybeSingle)
      chainMethods.forEach(m => {
        (result as any)[m] = builder[m];
      });
      return result;
    });
  });

  return builder;
}

// Мок storage
export function createMockStorage() {
  return {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://localhost/test.jpg' } }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: vi.fn().mockResolvedValue({ error: null }),
    }),
  };
}

// Дефолтный мок
export const mockSupabaseClient = createMockQueryBuilder();
(mockSupabaseClient as any).storage = createMockStorage();

export const getSupabaseServer = vi.fn(() => {
  const client = createMockQueryBuilder();
  (client as any).storage = createMockStorage();
  return client;
});

export const supabaseClient = mockSupabaseClient;
