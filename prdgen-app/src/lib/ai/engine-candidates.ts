/**
 * Server-side custom-engine resolution.
 *
 * Engine API keys never reach the browser anymore: clients send an
 * `engine_id`, this module loads the row (scoped to the authenticated owner),
 * decrypts the key here, and builds the provider candidate. An explicit
 * `base_url` + `api_key` pair is still accepted for ad-hoc engines, but the
 * URL must pass the SSRF guard first.
 */

import { prisma } from '@/lib/db/prisma';
import { decryptSecret } from '@/lib/crypto';
import { assertSafeBaseUrl } from '@/lib/net';
import {
  buildCustomCandidate,
  buildProviderCandidates,
  type AIProvider,
} from './providers';

export interface ResolvedEngineCandidate {
  provider: AIProvider;
  apiKey: string;
  modelString: string;
}

export type EngineCandidatesResult =
  | { ok: true; candidates: ResolvedEngineCandidate[] }
  | { ok: false; error: string };

export interface EngineRequestBody {
  model_id?: string;
  /** Saved CustomEngine id — key is resolved + decrypted server-side. */
  engine_id?: string;
  /** Ad-hoc (unsaved) engine: only honored after the SSRF guard passes. */
  base_url?: string;
  api_key?: string;
  compat?: string;
}

/**
 * Build the ordered provider candidates for a generation request:
 * custom engine (saved by id, or ad-hoc guarded) first, then env providers.
 * Returns `{ ok: false, error }` when an ad-hoc base_url is rejected (400).
 */
export async function buildEngineCandidates(
  userId: string,
  body: EngineRequestBody
): Promise<EngineCandidatesResult> {
  const modelId = body.model_id ?? '';
  const candidates = buildProviderCandidates(modelId);

  if (body.engine_id) {
    const engine = await prisma.customEngine.findFirst({
      where: { id: body.engine_id, userId },
    });
    if (!engine) {
      return { ok: false, error: 'Engine tidak ditemukan — pilih engine milikmu sendiri.' };
    }
    let apiKey: string | undefined;
    if (engine.apiKeyEnc) {
      try {
        apiKey = decryptSecret(engine.apiKeyEnc);
      } catch {
        apiKey = undefined; // rotated / corrupt — treat as missing key
      }
    }
    // Defense in depth: rows saved before save-time validation are re-checked
    // here. A blocked URL skips the custom candidate (built-ins still apply)
    // rather than failing the whole request.
    let engineBaseUrl = engine.baseUrl ?? undefined;
    if (engineBaseUrl) {
      const guard = assertSafeBaseUrl(engineBaseUrl);
      if (!guard.ok) {
        console.warn(`[engine-candidates] engine ${engine.id} skipped — ${guard.reason}`);
        engineBaseUrl = undefined;
      }
    }
    const custom = buildCustomCandidate({
      modelId: engine.model,
      baseUrl: engineBaseUrl,
      apiKey: engineBaseUrl ? apiKey : undefined,
      compat: engine.compat,
    });
    if (custom) candidates.unshift(custom);
    return { ok: true, candidates };
  }

  // Ad-hoc custom engine (not saved to the DB) — SSRF-guard the URL first.
  if (body.base_url) {
    const guard = assertSafeBaseUrl(body.base_url);
    if (!guard.ok) {
      return {
        ok: false,
        error: `Base URL engine ditolak: ${guard.reason} Simpan engine lewat halaman Engine untuk validasi.`,
      };
    }
    const custom = buildCustomCandidate({
      modelId,
      baseUrl: guard.url,
      apiKey: body.api_key,
      compat: body.compat,
    });
    if (custom) candidates.unshift(custom);
  }

  return { ok: true, candidates };
}
