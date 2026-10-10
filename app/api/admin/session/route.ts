import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/adminSession';

export async function GET(request: Request) {
  return NextResponse.json({ authenticated: await hasAdminSession(request) });
}
