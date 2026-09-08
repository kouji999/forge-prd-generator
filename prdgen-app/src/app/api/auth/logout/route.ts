import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { DEV_SESSION_COOKIE_NAME } from '@/lib/auth/dev-session';

export const dynamic = 'force-dynamic';

/**
 * Sign out and return to /login.
 * Supabase mode: signs out of Supabase.
 * Dev mode (no Supabase configured): clears the local dev session cookie.
 */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    const response = NextResponse.redirect(new URL('/login', req.url), { status: 303 });
    response.cookies.set(DEV_SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
    return response;
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', req.url), { status: 303 });
}
