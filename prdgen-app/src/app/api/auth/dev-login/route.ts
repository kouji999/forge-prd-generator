import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  DEV_SESSION_COOKIE_NAME,
  DEV_SESSION_COOKIE_OPTIONS,
  signDevSessionValue,
} from '@/lib/auth/dev-session';

export const dynamic = 'force-dynamic';

/**
 * Local dev login — exists ONLY when Supabase env vars are absent.
 * Issues the signed forge_dev_session cookie. When Supabase IS configured
 * this route refuses (404) so production behavior is untouched.
 */
export async function POST() {
  if (isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Dev login is disabled when Supabase is configured.' },
      { status: 404 }
    );
  }

  const value = await signDevSessionValue();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEV_SESSION_COOKIE_NAME, value, DEV_SESSION_COOKIE_OPTIONS);
  return response;
}
