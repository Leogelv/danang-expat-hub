import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

// PATCH /api/notifications/read — пометить уведомления как прочитанные
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notification_ids } = body;

    // Валидация
    if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
      return NextResponse.json({ error: 'notification_ids is required and must be a non-empty array' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', notification_ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: notification_ids.length });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
