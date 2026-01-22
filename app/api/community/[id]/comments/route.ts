import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/community/[id]/comments - получение комментариев к посту
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    const { data, error } = await supabase
      .from('community_comments')
      .select('id, author_name, author_tg_id, body, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// POST /api/community/[id]/comments - добавление комментария
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { body: commentBody, authorName, authorTgId } = body;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    if (!commentBody || typeof commentBody !== 'string' || commentBody.trim().length === 0) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    // Проверяем существование поста
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Создаём комментарий
    const { data: comment, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        body: commentBody.trim(),
        author_name: authorName || null,
        author_tg_id: authorTgId || null,
      })
      .select('id, author_name, author_tg_id, body, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
