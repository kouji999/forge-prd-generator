/**
 * Dev-mode session: a signed cookie used ONLY when Supabase is not configured
 * (see src/lib/supabase/config.ts). Never active in the configured path.
 *
 * Cookie value = HMAC-SHA256("forge-dev-session-v1", secret) where the secret
 * comes from ENGINE_ENC_SECRET. When that env var is missing we fall back to a
 * fixed dev-only secret with a one-time warning — acceptable because this
 * entire path is unreachable once Supabase env vars are set.
 *
 * Edge-safe: uses Web Crypto (globalThis.crypto.subtle) which is available in
 * the middleware edge runtime and Node >= 18. No Node-only APIs.
 */

export const DEV_SESSION_COOKIE_NAME = 'forge_dev_session';
export const DEV_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/** Deterministic local dev user (Prisma User.id is a native UUID column). */
export const DEV_USER_ID = '00000000-0000-4000-8000-0000000000de';
export const DEV_USER_EMAIL = 'dev@forge.local';
export const DEV_USER_NAME = 'Dev Mode';

const DEV_SESSION_PAYLOAD = 'forge-dev-session-v1';
const FALLBACK_SECRET = 'forge-dev-mode';

let warnedFallbackSecret = false;

function getSecret(): string {
  const secret = process.env.ENGINE_ENC_SECRET;
  if (secret) return secret;
  if (!warnedFallbackSecret) {
    warnedFallbackSecret = true;
    console.warn(
      '[dev-session] ENGINE_ENC_SECRET is not set — using a fixed dev-only secret. ' +
        'Dev mode only; set Supabase env vars or ENGINE_ENC_SECRET for anything beyond local use.'
    );
  }
  return FALLBACK_SECRET;
}

async function hmac(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Creates the cookie value for the local dev session. */
export async function signDevSessionValue(): Promise<string> {
  return hmac(DEV_SESSION_PAYLOAD, getSecret());
}

/** Verifies a dev-session cookie value (constant-time compare). */
export async function verifyDevSessionValue(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const expected = await hmac(DEV_SESSION_PAYLOAD, getSecret());
  if (value.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= value.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
