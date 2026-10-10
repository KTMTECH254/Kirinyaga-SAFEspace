import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthProfileId } from '@/lib/authSession';

export async function POST(req: Request) {
  try {
    const profileId = getAuthProfileId(req);
    if (!profileId) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    const body = await req.json();

    const payload: Record<string, unknown> = {};
    const requestedName = typeof body.displayName === 'string' ? body.displayName.trim() : '';

    if (requestedName) {
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('anonymous_name', requestedName)
        .neq('id', profileId)
        .maybeSingle();

      if (existingError) {
        return NextResponse.json({ error: 'Unable to update profile.' }, { status: 500 });
      }

      if (existing) {
        return NextResponse.json({ error: 'Unable to update profile.' }, { status: 400 });
      }

      payload.display_name = requestedName;
      payload.anonymous_name = requestedName;
    }
    if (body.preferences && typeof body.preferences === 'object') {
      payload.preferences = body.preferences;
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'No updates provided.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(payload)
      .eq('id', profileId)
      .select('id, anonymous_name, display_name, preferences')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Unable to update profile.' }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
