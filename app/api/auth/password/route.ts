import { NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const safeProfileFields = 'id, user_id, anonymous_name, display_name, preferences, created_at';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action;
    const anonymousName = typeof body.anonymousName === 'string' ? body.anonymousName.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!anonymousName || !password) {
      return NextResponse.json({ error: 'Anonymous name and password are required.' }, { status: 400 });
    }

    if (action === 'sign-up') {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }

      const { data: existing, error: lookupError } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('anonymous_name', anonymousName)
        .maybeSingle();

      if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 400 });
      if (existing) return NextResponse.json({ error: 'Anonymous name is already taken.' }, { status: 409 });

      const passwordHash = await hash(password, 10);
      const { data: profile, error } = await supabaseAdmin
        .from('user_profiles')
        .insert({ anonymous_name: anonymousName, password_hash: passwordHash })
        .select(safeProfileFields)
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ profile });
    }

    if (action === 'sign-in') {
      const { data: profile, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id, user_id, anonymous_name, display_name, preferences, created_at, password_hash')
        .eq('anonymous_name', anonymousName)
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (!profile) return NextResponse.json({ error: 'This anonymous name does not exist. Please sign up first.' }, { status: 404 });

      const passwordOk = await compare(password, profile.password_hash || '');
      if (!passwordOk) return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });

      const { password_hash: _passwordHash, ...safeProfile } = profile;
      return NextResponse.json({ profile: safeProfile });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Authentication request failed.' }, { status: 500 });
  }
}
