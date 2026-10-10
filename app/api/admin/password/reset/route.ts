import bcrypt from 'bcryptjs';
import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function matches(provided: string, expected: string | undefined) {
  if (!expected) return false;
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  return providedBytes.length === expectedBytes.length && timingSafeEqual(providedBytes, expectedBytes);
}

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function POST(request: Request) {
  const configuredToken = process.env.ADMIN_PASSWORD_RESET_TOKEN;
  if (!configuredToken || Buffer.byteLength(configuredToken, 'utf8') < 32) {
    return NextResponse.json(
      { error: 'Password recovery is not configured. Set a strong ADMIN_PASSWORD_RESET_TOKEN on the server.' },
      { status: 503 }
    );
  }

  let body: { recoveryToken?: unknown; newUsername?: unknown; newPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { recoveryToken, newUsername, newPassword } = body;
  if (typeof recoveryToken !== 'string' || !matches(recoveryToken, configuredToken)) {
    return NextResponse.json({ error: 'Invalid recovery token.' }, { status: 401 });
  }
  if (typeof newUsername !== 'string' || typeof newPassword !== 'string') {
    return NextResponse.json({ error: 'Enter a new username and password.' }, { status: 400 });
  }
  const normalizedUsername = newUsername.trim();
  if (normalizedUsername.length < 3 || normalizedUsername.length > 64) {
    return NextResponse.json({ error: 'The username must be 3–64 characters long.' }, { status: 400 });
  }

  const passwordLength = Buffer.byteLength(newPassword, 'utf8');
  if (passwordLength < 12 || passwordLength > 72) {
    return NextResponse.json({ error: 'The new password must be 12–72 bytes long.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_credentials')
      .select('id,recovery_token_hash')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Admin password storage is not ready. Apply the admin credentials database migration first.' },
        { status: 503 }
      );
    }

    const recoveryHash = tokenHash(configuredToken);
    if (data?.recovery_token_hash && matches(data.recovery_token_hash, recoveryHash)) {
      return NextResponse.json(
        { error: 'This recovery token has already been used. Rotate ADMIN_PASSWORD_RESET_TOKEN on the server and try again.' },
        { status: 410 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const values = {
      admin_username: normalizedUsername,
      password_hash: passwordHash,
      recovery_token_hash: recoveryHash,
      updated_at: new Date().toISOString()
    };

    if (!data) {
      const { error: insertError } = await supabaseAdmin
        .from('admin_credentials')
        .insert({ id: 1, ...values });

      if (insertError) {
        if (insertError.code === '23505') {
          return NextResponse.json({ error: 'Password recovery was already completed. Please sign in.' }, { status: 409 });
        }
        throw insertError;
      }
    } else {
      let updateQuery = supabaseAdmin
        .from('admin_credentials')
        .update(values)
        .eq('id', 1);
      updateQuery = data.recovery_token_hash
        ? updateQuery.eq('recovery_token_hash', data.recovery_token_hash)
        : updateQuery.is('recovery_token_hash', null);

      const { data: updated, error: updateError } = await updateQuery.select('id').maybeSingle();
      if (updateError) throw updateError;
      if (!updated) {
        return NextResponse.json({ error: 'Password recovery was already completed. Please sign in.' }, { status: 409 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin password recovery failed:', error);
    return NextResponse.json({ error: 'Unable to reset the admin password. Please try again.' }, { status: 500 });
  }
}
