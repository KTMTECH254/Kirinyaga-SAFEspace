import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const COOKIE_NAME = 'kirinyaga_admin_session';
const MAX_AGE = 60 * 60 * 8;

async function signingKey() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error('Missing env: SUPABASE_SECRET_KEY');

  const { data, error } = await supabaseAdmin
    .from('admin_credentials')
    .select('admin_username,password_hash')
    .eq('id', 1)
    .maybeSingle();

  if (error && !['42P01', 'PGRST205'].includes(error.code)) throw error;
  const passwordMaterial = data?.password_hash || process.env.ADMIN_PASSWORD;
  const usernameMaterial = data?.admin_username || process.env.ADMIN_USERNAME;
  if (!passwordMaterial || !usernameMaterial) throw new Error('Missing admin credentials.');
  return createHmac('sha256', secret).update(`${usernameMaterial}\0${passwordMaterial}`).digest();
}

function signature(value: string, key: Buffer) {
  return createHmac('sha256', key).update(value).digest('base64url');
}

export async function setAdminSession(response: NextResponse) {
  const value = Buffer.from(JSON.stringify({ expiresAt: Math.floor(Date.now() / 1000) + MAX_AGE })).toString('base64url');
  response.cookies.set(COOKIE_NAME, `${value}.${signature(value, await signingKey())}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });
}

export async function hasAdminSession(request: NextRequest | Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = cookieHeader.split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE_NAME}=`));
  const token = cookie?.slice(COOKIE_NAME.length + 1);
  if (!token) return false;
  const [value, supplied] = token.split('.');
  if (!value || !supplied) return false;
  try {
    const expected = Buffer.from(signature(value, await signingKey()));
    const actual = Buffer.from(supplied);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const payload = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as { expiresAt?: number };
    return typeof payload.expiresAt === 'number' && payload.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
