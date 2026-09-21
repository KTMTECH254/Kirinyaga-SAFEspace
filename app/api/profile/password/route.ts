import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { compare, hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profileId = typeof body.profileId === 'string' ? body.profileId : '';
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!profileId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, password_hash')
      .eq('id', profileId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const passwordOk = await compare(currentPassword, profile?.password_hash || '');
    if (!passwordOk) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const nextHash = await hash(newPassword, 10);
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ password_hash: nextHash })
      .eq('id', profileId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }
}
