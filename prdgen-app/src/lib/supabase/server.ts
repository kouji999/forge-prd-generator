import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Reads/writes the session cookies via next/headers.
 *
 * Callers must check isSupabaseConfigured() first when the app should also
 * run without Supabase (dev fallback); this throws a clear error instead of
 * supabase-js's cryptic "supabaseUrl is required".
 */
export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing). ' +
        'Gate Supabase usage behind isSupabaseConfigured() — see src/lib/supabase/config.ts.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore; middleware
            // refreshes the session cookies on the response instead.
          }
        },
      },
    }
  );
}
