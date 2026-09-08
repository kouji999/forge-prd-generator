import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * Supabase client for Client Components (login/register/OAuth buttons).
 *
 * Callers must check isSupabaseConfigured() first (NEXT_PUBLIC_* vars are
 * inlined at build time, so this works client-side); this throws a clear
 * error instead of supabase-js's cryptic "supabaseUrl is required".
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing). ' +
        'Gate Supabase usage behind isSupabaseConfigured() — see src/lib/supabase/config.ts.'
    );
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
