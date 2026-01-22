import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

const TABLE_MAP: Record<string, { table: string; title: string; description: string; location?: string; price?: string; contact?: string }> = {
  listing: { table: 'listings', title: 'title', description: 'description', location: 'location', price: 'price', contact: 'contact' },
  market: { table: 'market_items', title: 'title', description: 'description', price: 'price', contact: 'contact' },
  place: { table: 'places', title: 'name', description: 'description', location: 'address', contact: 'contact' },
  event: { table: 'events', title: 'title', description: 'description', location: 'location', contact: 'organizer_contact' },
  post: { table: 'community_posts', title: 'title', description: 'body' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('source, item_id, created_at')
      .eq('tg_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const grouped = (favorites ?? []).reduce<Record<string, string[]>>((acc, fav) => {
      acc[fav.source] = acc[fav.source] || [];
      acc[fav.source].push(fav.item_id);
      return acc;
    }, {});

    const results = await Promise.all(
      Object.entries(grouped).map(async ([source, ids]) => {
        const config = TABLE_MAP[source];
        if (!config) return [];

        const { data, error: tableError } = await supabase
          .from(config.table)
          .select('*')
          .in('id', ids);

        if (tableError || !data) return [];

        return data.map((row: any) => ({
          id: row.id,
          source,
          title: row[config.title] ?? 'Untitled',
          description: row[config.description] ?? null,
          location: config.location ? row[config.location] ?? null : null,
          price: config.price ? row[config.price] ?? null : null,
          contact: config.contact ? row[config.contact] ?? null : null,
        }));
      }),
    );

    return NextResponse.json({ data: results.flat() });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, source, itemId } = await request.json();

    if (!userId || !source || !itemId) {
      return NextResponse.json({ error: 'userId, source, itemId are required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });
    const { data, error } = await supabase
      .from('favorites')
      .insert({ tg_user_id: userId, source, item_id: itemId })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, source, itemId } = await request.json();

    if (!userId || !source || !itemId) {
      return NextResponse.json({ error: 'userId, source, itemId are required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('tg_user_id', userId)
      .eq('source', source)
      .eq('item_id', itemId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
