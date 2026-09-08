/**
 * SSRF guard for user-supplied Base URLs (custom AI engines).
 *
 * Pure function — no fetch, no DNS. Checks the URL's hostname/IP form against
 * local/internal ranges that must never be reached from the server unless the
 * deployment explicitly opts in via ALLOW_LOCAL_AI_ENDPOINTS=true
 * (self-hosted single-user mode, where pointing at localhost proxies is the
 * intended use).
 *
 * Always blocked, even with the opt-in:
 * - 169.254.0.0/16 (cloud metadata endpoints, e.g. 169.254.169.254)
 * - anything that is not http/https
 */

const ALLOW_LOCAL =
  typeof process !== 'undefined' && process.env?.ALLOW_LOCAL_AI_ENDPOINTS === 'true';

export type SafeBaseUrlResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

function isIPv4DottedQuad(host: string): number[] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return null;
  const octets = m.slice(1).map(Number);
  if (octets.some((o) => o > 255)) return null;
  return octets;
}

/** Local/private IPv4 ranges (excluding metadata — always blocked). */
function isPrivateIPv4(o: number[]): boolean {
  const [a, b] = o;
  return (
    a === 127 ||          // loopback
    a === 10 ||           // private class A
    a === 0 ||            // 0.0.0.0/8 ("this host")
    (a === 172 && b >= 16 && b <= 31) || // private class B
    (a === 192 && b === 168)             // private class C
  );
}

/** Classify an already-normalized hostname. 'local' → opt-in required; 'metadata' → always blocked. */
function classifyHost(host: string): 'local' | 'metadata' | 'public' {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '').split('%')[0]; // strip brackets + IPv6 zone

  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.internal') || h.endsWith('.local')) {
    return 'local';
  }

  // IPv6 literals.
  if (h.includes(':')) {
    const v6 = h.toLowerCase();
    if (
      v6 === '::1' ||
      v6 === '::' ||
      v6.startsWith('fc') || v6.startsWith('fd') ||           // ULA fc00::/7
      v6.startsWith('fe8') || v6.startsWith('fe9') ||
      v6.startsWith('fea') || v6.startsWith('feb')            // link-local fe80::/10
    ) {
      return 'local';
    }
    return 'public'; // other public IPv6 literals
  }

  const v4 = isIPv4DottedQuad(h);
  if (v4) {
    const [a, b] = v4;
    if (a === 169 && b === 254) return 'metadata'; // cloud metadata — never
    if (isPrivateIPv4(v4)) return 'local';
    // Public IPv4 literal (e.g. self-hosted VPS) — allowed like a DNS name;
    // the SSRF-relevant ranges are already classified above.
    return 'public';
  }

  // Non-canonical IP encodings (decimal "2130706433" = 127.0.0.1, hex
  // "0x7f000001", octal mixes) — raw-IP forms that can't be DNS names and
  // can smuggle loopback past dotted-quad matching. Treat as local.
  if (/^\d+$/.test(h) || /^0[xX][0-9a-fA-F]+$/.test(h) || /^\d+[.\d]*$/.test(h)) {
    return 'local';
  }

  return 'public';
}

/**
 * Validate a user-supplied base URL for server-side fetching.
 * Accepts only http(s); blocks local/internal hosts unless
 * ALLOW_LOCAL_AI_ENDPOINTS=true (and never allows cloud metadata).
 */
export function assertSafeBaseUrl(raw: string): SafeBaseUrlResult {
  const trimmed = raw?.trim();
  if (!trimmed) return { ok: false, reason: 'Base URL kosong.' };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, reason: 'Base URL bukan URL yang valid.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Base URL harus memakai http:// atau https://.' };
  }

  const kind = classifyHost(parsed.hostname);
  if (kind === 'metadata') {
    return {
      ok: false,
      reason: 'Base URL menunjuk ke endpoint metadata internal (169.254.x.x) dan tidak diizinkan.',
    };
  }
  if (kind === 'local' && !ALLOW_LOCAL) {
    return {
      ok: false,
      reason:
        'Base URL menunjuk ke host lokal/internal (localhost, IP privat, *.local, *.internal) dan tidak diizinkan.',
    };
  }

  return { ok: true, url: parsed.toString() };
}
