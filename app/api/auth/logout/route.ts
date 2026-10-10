import { NextResponse } from 'next/server';
import { clearAuthSession } from '@/lib/authSession';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthSession(response);
  return response;
}
