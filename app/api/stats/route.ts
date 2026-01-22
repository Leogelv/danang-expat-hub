import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

async function countRows(table: string) {
  const supabase = getSupabaseServer({ serviceRole: true });
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function GET() {
  try {
    const [listings, market, places, events, posts] = await Promise.all([
      countRows('listings'),
      countRows('market_items'),
      countRows('places'),
      countRows('events'),
      countRows('community_posts'),
    ]);

    return NextResponse.json({
      listings,
      market,
      places,
      events,
      posts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load stats', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
