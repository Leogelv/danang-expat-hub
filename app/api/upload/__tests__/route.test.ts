import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder, createMockStorage } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { POST } from '../route';

// Хелпер: создаём полностью замоканный File с arrayBuffer
function createMockFile(size: number, name: string, type: string) {
  const buffer = new ArrayBuffer(size);
  return {
    name,
    type,
    size,
    arrayBuffer: vi.fn().mockResolvedValue(buffer),
    slice: vi.fn(),
    stream: vi.fn(),
    text: vi.fn().mockResolvedValue(''),
    lastModified: Date.now(),
  } as unknown as File;
}

// Хелпер: создаёт NextRequest с замоканным formData() и кастомным File
function createUploadRequest(file: File | null) {
  const req = new NextRequest('http://localhost/api/upload', { method: 'POST' });
  const mockFormData = {
    get: vi.fn().mockImplementation((key: string) => {
      if (key === 'file') return file;
      return null;
    }),
    getAll: vi.fn().mockReturnValue(file ? [file] : []),
    has: vi.fn().mockImplementation((key: string) => key === 'file' && file !== null),
    append: vi.fn(),
    delete: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
    keys: vi.fn(),
    set: vi.fn(),
    values: vi.fn(),
  } as unknown as FormData;
  vi.spyOn(req, 'formData').mockResolvedValue(mockFormData);
  return req;
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockSupabaseWithStorage() {
    const chain = createMockQueryBuilder([]);
    (chain as any).storage = createMockStorage();
    return chain;
  }

  it('returns 201 on valid file upload', async () => {
    const chain = createMockSupabaseWithStorage();
    (getSupabaseServer as any).mockReturnValue(chain);

    const file = createMockFile(1024, 'test.jpg', 'image/jpeg');
    const req = createUploadRequest(file);
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.url).toBe('http://localhost/test.jpg');
    expect(body.data.type).toBe('image/jpeg');
    expect(body.data.size).toBe(1024);
  });

  it('returns 400 when file is missing', async () => {
    const req = createUploadRequest(null);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('File is required');
  });

  it('returns 400 when file exceeds 5MB', async () => {
    const file = createMockFile(6 * 1024 * 1024, 'large.jpg', 'image/jpeg');
    const req = createUploadRequest(file);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('5MB');
  });

  it('returns 400 when file type is not allowed', async () => {
    const file = createMockFile(100, 'script.js', 'application/javascript');
    const req = createUploadRequest(file);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('JPEG');
  });

  it('returns 500 when storage upload fails', async () => {
    const chain = createMockQueryBuilder([]);
    const storage = createMockStorage();
    storage.from = vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: { message: 'Upload failed' } }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
    });
    (chain as any).storage = storage;
    (getSupabaseServer as any).mockReturnValue(chain);

    const file = createMockFile(100, 'test.png', 'image/png');
    const req = createUploadRequest(file);
    const res = await POST(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Upload failed');
  });
});
