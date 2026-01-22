import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { query, category, source, limit } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });
    const safeLimit = Math.min(Math.max(Number(limit) || 6, 1), 20);

    let dbQuery = supabase
      .from('search_items')
      .select('*')
      .limit(safeLimit)
      .order('created_at', { ascending: false });

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    if (source) {
      dbQuery = dbQuery.eq('source', source);
    }

    const like = `%${query}%`;
    dbQuery = dbQuery.or(`title.ilike.${like},description.ilike.${like},location.ilike.${like}`);

    const { data, error } = await dbQuery;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
