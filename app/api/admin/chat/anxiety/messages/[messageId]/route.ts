import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/adminSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ messageId: string }> }
) {
  if (!(await hasAdminSession(request))) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  const { messageId } = await context.params;
  if (!messageId || messageId.length > 128) {
    return NextResponse.json({ error: 'Invalid message ID.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      message: '[Message deleted]'
    })
    .eq('id', messageId)
    .eq('room_id', 'anxiety')
    .eq('is_deleted', false)
    .select('id,message,is_deleted,deleted_at')
    .maybeSingle();

  if (error) {
    console.error('Admin anxiety message deletion failed:', error);
    return NextResponse.json({ error: 'Unable to delete this message.' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Message not found or already deleted.' }, { status: 404 });
  }

  return NextResponse.json({ message: data });
}
