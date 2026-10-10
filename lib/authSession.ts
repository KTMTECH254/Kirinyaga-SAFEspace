import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'kirinyaga_session';
const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = { profileId: string; expiresAt: number };

function getSigningKey() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error('Missing env: SUPABASE_SECRET_KEY');
  return key;
}

function sign(value: string) {
  return createHmac('sha256', getSigningKey()).update(value).digest('base64url');
}

export function setAuthSession(response: NextResponse, profileId: string) {
  const payload: SessionPayload = {
    profileId,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS
  };
  const value = Buffer.from(JSON.stringify(payload)).toString('base64url');
  response.cookies.set(COOKIE_NAME, `${value}.${sign(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_LIFETIME_SECONDS
  });
}

export function clearAuthSession(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });
}

export function getAuthProfileId(request: NextRequest | Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = cookieHeader.split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE_NAME}=`));
  const token = cookie?.slice(COOKIE_NAME.length + 1);
  if (!token) return null;

  const [value, providedSignature] = token.split('.');
  if (!value || !providedSignature) return null;

  const expectedSignature = sign(value);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.profileId || payload.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return payload.profileId;
  } catch {
    return null;
  }
}
