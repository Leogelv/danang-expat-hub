import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam) || 12, 1), 50);

    const supabase = getSupabaseServer({ serviceRole: true });
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

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
