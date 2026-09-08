import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  DEV_SESSION_COOKIE_NAME,
  DEV_USER_ID,
  DEV_USER_EMAIL,
  verifyDevSessionValue,
} from '@/lib/auth/dev-session';

/**
 * Minimal user shape consumed by the root middleware (truthiness gate only).
 * The Supabase User satisfies it structurally.
 */
type SessionUser = { id: string; email?: string | undefined } | null;

/**
 * Refreshes the Supabase session on every request and exposes the current
 * user + session_id. Edge-safe: no Prisma, no Node-only APIs.
 *
 * When Supabase is NOT configured (local dev without a Supabase project) the
 * Supabase client is never constructed — instead the session gate checks the
 * signed dev cookie issued by POST /api/auth/dev-login.
 *
 * Returns the mutable response (carrying refreshed auth cookies) which the
 * root middleware MUST return (possibly after copying redirect headers).
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: SessionUser;
}> {
  if (!isSupabaseConfigured()) {
    // Dev fallback: no Supabase client, no session refresh. Gate on the
    // signed dev cookie instead so authed areas stay protected.
    const response = NextResponse.next({ request });
    const cookie = request.cookies.get(DEV_SESSION_COOKIE_NAME)?.value;
    const valid = await verifyDevSessionValue(cookie);
    return {
      response,
      user: valid ? { id: DEV_USER_ID, email: DEV_USER_EMAIL } : null,
    };
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() validates the token with the Supabase auth server (not just
  // decoding the cookie), so it's safe to gate on.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
