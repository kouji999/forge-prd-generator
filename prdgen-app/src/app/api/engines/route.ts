import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUser } from '@/lib/auth/get-auth-user';
import { encryptSecret, decryptSecret } from '@/lib/crypto';
import { assertSafeBaseUrl } from '@/lib/net';

export const dynamic = 'force-dynamic';

/**
 * Per-user custom AI engines. API keys are encrypted at rest (AES-256-GCM)
 * and NEVER returned in plaintext — the client only ever sees a mask
 * ('••••abcd'). Generation routes decrypt server-side when the user's saved
 * engine is used (see src/lib/ai/engine-candidates.ts).
 */

/** '••••' + last 4 chars; short keys fully masked. */
function maskKey(plain: string): string {
  return plain.length > 4 ? `••••${plain.slice(-4)}` : '••••';
}

/** Masked view of one engine row. */
function engineView(e: {
  id: string;
  name: string;
  model: string;
  baseUrl: string | null;
  apiKeyEnc: string | null;
  compat: string;
}) {
  let apiKeyMasked: string | undefined;
  if (e.apiKeyEnc) {
    try {
      apiKeyMasked = maskKey(decryptSecret(e.apiKeyEnc));
    } catch {
      apiKeyMasked = undefined; // secret rotated / corrupt — treat as missing
    }
  }
  return {
    id: e.id,
    name: e.name,
    model: e.model,
    baseUrl: e.baseUrl ?? undefined,
    apiKeyMasked,
    compat: (e.compat === 'anthropic' ? 'anthropic' : 'openai') as 'openai' | 'anthropic',
  };
}

/** Validate a user-supplied engine base URL (SSRF guard). Returns error text or null. */
function validateBaseUrl(baseUrl: string | undefined): string | null {
  const trimmed = baseUrl?.trim();
  if (!trimmed) return null; // optional — env providers are the fallback
  const guard = assertSafeBaseUrl(trimmed);
  return guard.ok ? null : `Base URL tidak aman: ${guard.reason}`;
}

// GET /api/engines → the user's engines (key masked, never plaintext).
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await prisma.customEngine.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ data: rows.map(engineView) });
}

// POST /api/engines → create an engine (encrypts apiKey). Body: {name, model, baseUrl?, apiKey?, compat}
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    model?: string;
    baseUrl?: string;
    apiKey?: string;
    compat?: string;
  };
  const name = body.name?.trim();
  const model = body.model?.trim();
  if (!name || !model) {
    return NextResponse.json({ error: 'Nama dan Model ID wajib diisi.' }, { status: 400 });
  }

  const baseUrlError = validateBaseUrl(body.baseUrl);
  if (baseUrlError) return NextResponse.json({ error: baseUrlError }, { status: 400 });

  const created = await prisma.customEngine.create({
    data: {
      userId: user.id,
      name,
      model,
      baseUrl: body.baseUrl?.trim() || null,
      apiKeyEnc: body.apiKey?.trim() ? encryptSecret(body.apiKey.trim()) : null,
      compat: body.compat === 'anthropic' ? 'anthropic' : 'openai',
    },
  });

  return NextResponse.json({ data: engineView(created) });
}

// PATCH /api/engines → update one owned engine. Body: {id, name?, model?, baseUrl?, apiKey?, compat?}
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    name?: string;
    model?: string;
    baseUrl?: string;
    apiKey?: string;
    compat?: string;
  };

  const id = body.id?.trim();
  if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });

  // Only build fields that were actually provided — never wipe unspecified values.
  const updates: {
    name?: string;
    model?: string;
    baseUrl?: string | null;
    apiKeyEnc?: string;
    compat?: string;
  } = {};

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.model !== undefined) updates.model = body.model.trim();
  if (body.baseUrl !== undefined) updates.baseUrl = body.baseUrl.trim() || null;
  if (body.compat !== undefined) {
    updates.compat = body.compat === 'anthropic' ? 'anthropic' : 'openai';
  }

  // Only re-encrypt when a non-empty apiKey is supplied; otherwise leave apiKeyEnc as-is.
  const newApiKey = body.apiKey?.trim();
  if (newApiKey) updates.apiKeyEnc = encryptSecret(newApiKey);

  const baseUrlError = validateBaseUrl(body.baseUrl);
  if (baseUrlError) return NextResponse.json({ error: baseUrlError }, { status: 400 });

  // Ownership-scoped update: nothing changes unless {id, userId} matches.
  const result = await prisma.customEngine.updateMany({
    where: { id, userId: user.id },
    data: updates,
  });
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.customEngine.findFirst({ where: { id, userId: user.id } });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: engineView(updated) });
}

// DELETE /api/engines?id=<uuid> → remove one owned engine.
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });

  const result = await prisma.customEngine.deleteMany({ where: { id, userId: user.id } });
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
