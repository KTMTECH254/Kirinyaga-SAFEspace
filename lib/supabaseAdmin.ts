import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseSecretKey) {
  throw new Error('Missing env: SUPABASE_SECRET_KEY');
}

// This module is for Next.js route handlers and other server-only code.
// Never import it from a Client Component or expose its key with a NEXT_PUBLIC_ prefix.
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
