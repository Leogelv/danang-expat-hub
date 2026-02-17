import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/events/[id]/rsvp — получение списка участников события
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabase = getSupabaseServer({ serviceRole: true });
    const { data, error } = await supabase
      .from('event_attendees')
      .select('id, user_id, status, created_at')
      .eq('event_id', id)
      .order('created_at', { ascending: true });

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

// POST /api/events/[id]/rsvp — записаться на событие (upsert)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user_id, status } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const validStatuses = ['going', 'interested', 'not_going'];
    const rsvpStatus = validStatuses.includes(status) ? status : 'going';

    const supabase = getSupabaseServer({ serviceRole: true });

    // Upsert — если уже есть запись, обновляем статус
    const { data, error } = await supabase
      .from('event_attendees')
      .upsert(
        { event_id: id, user_id, status: rsvpStatus },
        { onConflict: 'event_id,user_id' }
      )
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

// DELETE /api/events/[id]/rsvp — отписаться от события
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    const { error } = await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', id)
      .eq('user_id', user_id);

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
