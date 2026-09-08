/**
 * Runtime detection of Supabase configuration.
 *
 * When both public env vars are present the app uses the real Supabase auth
 * flow (production behavior, byte-identical). When they are absent the app
 * falls back to a signed local dev session so the app runs with zero Supabase
 * setup (dev mode only — never activates when the env vars exist).
 *
 * Edge-safe: NEXT_PUBLIC_* vars are inlined by the compiler, so this works
 * in middleware (edge runtime), server components, and client components.
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
