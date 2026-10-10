import { NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { setAuthSession } from '@/lib/authSession';

const safeProfileFields = 'id, anonymous_name, display_name, preferences, created_at';

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

      if (lookupError) return NextResponse.json({ error: 'Unable to create account.' }, { status: 500 });
      // Do not reveal whether a name is registered. The response is identical
      // for an existing name and a successful creation.
      if (existing) return NextResponse.json({ success: true });

      const passwordHash = await hash(password, 10);
      const { data: profile, error } = await supabaseAdmin
        .from('user_profiles')
        .insert({ anonymous_name: anonymousName, password_hash: passwordHash })
        .select(safeProfileFields)
        .single();

      if (error) return NextResponse.json({ error: 'Unable to create account.' }, { status: 500 });
      return NextResponse.json({ success: true, profile });
    }

    if (action === 'sign-in') {
      const { data: profile, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id, anonymous_name, display_name, preferences, created_at, password_hash')
        .eq('anonymous_name', anonymousName)
        .maybeSingle();

      if (error) return NextResponse.json({ error: 'Unable to sign in. Check your name and password.' }, { status: 401 });
      if (!profile) return NextResponse.json({ error: 'Unable to sign in. Check your name and password.' }, { status: 401 });

      const passwordOk = await compare(password, profile.password_hash || '');
      if (!passwordOk) return NextResponse.json({ error: 'Unable to sign in. Check your name and password.' }, { status: 401 });

      const { password_hash: _passwordHash, ...safeProfile } = profile;
      const response = NextResponse.json({ profile: safeProfile });
      setAuthSession(response, profile.id);
      return response;
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Authentication request failed.' }, { status: 500 });
  }
}
