import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { setAdminSession } from '@/lib/adminSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function matches(provided: string, expected: string | undefined) {
  if (!expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function getAdminCredentials() {
  const { data, error } = await supabaseAdmin
    .from('admin_credentials')
    .select('admin_username,password_hash')
    .eq('id', 1)
    .maybeSingle();

  if (error && !['42P01', 'PGRST205'].includes(error.code)) {
    throw error;
  }

  return data;
}

async function isValidPassword(password: string, passwordHash?: string | null) {
  if (passwordHash) return bcrypt.compare(password, passwordHash);
  return matches(password, process.env.ADMIN_PASSWORD);
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const credentials = await getAdminCredentials();
    const expectedUsername = credentials?.admin_username || process.env.ADMIN_USERNAME;
    if (!matches(username, expectedUsername) || !(await isValidPassword(password, credentials?.password_hash))) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    await setAdminSession(response);
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to sign in. Check the admin credential setup and try again.' }, { status: 503 });
  }
}
