import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { compare, hash } from 'bcryptjs';
import { getAuthProfileId } from '@/lib/authSession';

export async function POST(req: Request) {
  try {
    const profileId = getAuthProfileId(req);
    if (!profileId) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    const body = await req.json();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, password_hash')
      .eq('id', profileId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Unable to update password.' }, { status: 500 });
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
      return NextResponse.json({ error: 'Unable to update password.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }
}
