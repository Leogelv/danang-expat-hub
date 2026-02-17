import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

// POST /api/upload — загрузка файла в Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Ограничение размера — 5 MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Разрешённые типы файлов
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    // Генерируем уникальное имя файла
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `uploads/${fileName}`;

    // Конвертируем File в ArrayBuffer для загрузки
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Получаем публичный URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return NextResponse.json({
      data: {
        url: urlData.publicUrl,
        fileName,
        size: file.size,
        type: file.type,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
