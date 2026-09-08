/**
 * Client-side custom-engine resolver.
 *
 * Engine configs live per-user in the DB (GET /api/engines). The API returns
 * only a MASKED key — plaintext keys never reach the browser. Callers send
 * the engine's `id` (`engine_id`) with generation requests; the server loads
 * the row (owner-scoped) and decrypts the key itself
 * (see src/lib/ai/engine-candidates.ts).
 *
 * Never throws: a null return means "no custom engine — let the server fall
 * back to its env-configured providers".
 */

export interface EngineRef {
  /** Sent as `engine_id` on generate/refine/plan requests. */
  engine_id: string;
  /** Sent as `model_id` — the saved engine's model string. */
  model_id: string;
  compat: string;
}

export interface EngineListEntry {
  id: string;
  name: string;
  model: string;
  baseUrl?: string;
  /** Mask like '••••abcd' — display only, never a usable key. */
  apiKeyMasked?: string;
  compat?: 'openai' | 'anthropic';
}

// Shared across all callers; a failed fetch resets this so a later call retries.
let enginesPromise: Promise<EngineListEntry[]> | null = null;

function loadEngines(): Promise<EngineListEntry[]> {
  if (!enginesPromise) {
    enginesPromise = fetch('/api/engines')
      .then(async (res) => {
        if (!res.ok) throw new Error(`engines fetch failed: ${res.status}`);
        const json = (await res.json()) as { data?: EngineListEntry[] };
        return Array.isArray(json.data) ? json.data : [];
      })
      .catch((err) => {
        enginesPromise = null; // reset so the next call retries
        throw err;
      });
  }
  return enginesPromise;
}

/**
 * Resolve the engine to reference in a generation request body.
 * Returns `{ engine_id, model_id, compat }` — no key material — or null when
 * no saved engine matches / the fetch fails (fallback: server env providers).
 */
export async function fetchEngineRef(
  modelId: string | null | undefined
): Promise<EngineRef | null> {
  if (!modelId) return null;
  try {
    const engines = await loadEngines();
    const match = engines.find(
      (e) => e.model === modelId || e.id === modelId || e.name === modelId
    );
    if (match?.id) {
      return { engine_id: match.id, model_id: match.model, compat: match.compat ?? 'openai' };
    }
  } catch (err) {
    // Log + degrade to null — generation still works via server env providers.
    console.warn('[engines-client] engine lookup failed, falling back to server providers:', err);
  }
  return null;
}
