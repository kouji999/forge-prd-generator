import 'server-only';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  DEV_SESSION_COOKIE_NAME,
  DEV_USER_ID,
  DEV_USER_EMAIL,
  DEV_USER_NAME,
  verifyDevSessionValue,
} from '@/lib/auth/dev-session';
import { prisma } from '@/lib/db/prisma';

interface AuthedUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

/**
 * Server-side auth guard for RSC / route handlers.
 * Validates the Supabase session and lazily upserts the Prisma user row
 * (Supabase UID = User.id). Returns null when not signed in.
 *
 * When Supabase is NOT configured (local dev) it verifies the signed dev
 * cookie from POST /api/auth/dev-login and ensures a fixed local dev user
 * row instead — the Supabase client is never constructed.
 */
export async function getAuthUser(): Promise<AuthedUser | null> {
  if (!isSupabaseConfigured()) {
    // Dev fallback: gate on the signed dev cookie, no Supabase call.
    const cookieStore = await cookies();
    const valid = await verifyDevSessionValue(cookieStore.get(DEV_SESSION_COOKIE_NAME)?.value);
    if (!valid) return null;

    // Best-effort upsert of the dev user row. If the DB is unreachable or
    // DATABASE_URL is missing, we still return the synthetic user object so
    // pages render instead of hard-crashing; DB-backed calls will fail on
    // their own in that case.
    try {
      const dbUser = await prisma.user.upsert({
        where: { id: DEV_USER_ID },
        update: { email: DEV_USER_EMAIL, name: DEV_USER_NAME, emailVerified: true },
        create: {
          id: DEV_USER_ID,
          email: DEV_USER_EMAIL,
          name: DEV_USER_NAME,
          emailVerified: true,
        },
      });
      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatarUrl: dbUser.avatarUrl,
      };
    } catch {
      return { id: DEV_USER_ID, email: DEV_USER_EMAIL, name: DEV_USER_NAME, avatarUrl: null };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const name: string | null = meta.full_name ?? meta.name ?? null;
  const avatarUrl: string | null = meta.avatar_url ?? meta.picture ?? null;
  const email = user.email ?? '';

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: { email, name, avatarUrl, emailVerified: true },
    create: { id: user.id, email, name, avatarUrl, emailVerified: true },
  });

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatarUrl: dbUser.avatarUrl,
  };
}

/** RSC variant: redirects to /login when not authenticated. */
export async function getAuthUserOrRedirect(): Promise<AuthedUser> {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  return user;
}
