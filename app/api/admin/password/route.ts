import bcrypt from 'bcryptjs';
import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { clearAdminSession, hasAdminSession } from '@/lib/adminSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function matches(provided: string, expected: string | undefined) {
  if (!expected) return false;
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  return providedBytes.length === expectedBytes.length && timingSafeEqual(providedBytes, expectedBytes);
}

export async function POST(request: Request) {
  if (!(await hasAdminSession(request))) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  let body: { currentPassword?: unknown; newUsername?: unknown; newPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { currentPassword, newUsername, newPassword } = body;
  if (typeof currentPassword !== 'string' || typeof newUsername !== 'string' ||
      (newPassword !== undefined && typeof newPassword !== 'string')) {
    return NextResponse.json({ error: 'Enter your current password and a new username.' }, { status: 400 });
  }

  const normalizedUsername = newUsername.trim();
  if (normalizedUsername.length < 3 || normalizedUsername.length > 64) {
    return NextResponse.json({ error: 'The username must be 3–64 characters long.' }, { status: 400 });
  }

  const wantsPasswordChange = typeof newPassword === 'string' && newPassword.length > 0;
  if (wantsPasswordChange) {
    const newPasswordBytes = Buffer.byteLength(newPassword, 'utf8');
    if (newPasswordBytes < 12 || newPasswordBytes > 72) {
      return NextResponse.json({ error: 'The new password must be 12–72 bytes long.' }, { status: 400 });
    }
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_credentials')
      .select('password_hash')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Admin password storage is not ready. Apply the admin credentials database migration first.' },
        { status: 503 }
      );
    }

    const currentPasswordIsValid = data?.password_hash
      ? await bcrypt.compare(currentPassword, data.password_hash)
      : matches(currentPassword, process.env.ADMIN_PASSWORD);

    if (!currentPasswordIsValid) {
      return NextResponse.json({ error: 'The current password is incorrect.' }, { status: 401 });
    }

    if (wantsPasswordChange) {
      if (data?.password_hash && await bcrypt.compare(newPassword, data.password_hash)) {
        return NextResponse.json({ error: 'Choose a password you have not used as your current password.' }, { status: 400 });
      }
      if (!data?.password_hash && matches(newPassword, process.env.ADMIN_PASSWORD)) {
        return NextResponse.json({ error: 'Choose a password different from your current password.' }, { status: 400 });
      }
    }

    const passwordHash = wantsPasswordChange
      ? await bcrypt.hash(newPassword, 12)
      : data?.password_hash || await bcrypt.hash(currentPassword, 12);
    const { error: saveError } = await supabaseAdmin
      .from('admin_credentials')
      .upsert({
        id: 1,
        admin_username: normalizedUsername,
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      });

    if (saveError) throw saveError;
    const response = NextResponse.json({ success: true });
    clearAdminSession(response);
    return response;
  } catch (error) {
    console.error('Admin password change failed:', error);
    return NextResponse.json({ error: 'Unable to change the admin password. Please try again.' }, { status: 500 });
  }
}
