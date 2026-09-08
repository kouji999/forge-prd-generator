import Link from 'next/link';
import { FileText, Link2Off } from 'lucide-react';
import { prisma } from '@/lib/db/prisma';
import { PRD_SECTIONS } from '@/types';
import { SharedMarkdown } from '@/components/prd/SharedMarkdown';
import { ShareExportBar } from '@/components/prd/ShareExportBar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Logo } from '@/components/shared/Logo';
import { generateFullMarkdown } from '@/lib/export';
import type { PRD, PRDContent, PRDStatus } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Resolve a share token to its PRD via the shared_links table.
 * A link is valid only when it exists, is active, and (when set) has not
 * expired. Returns null for unknown/revoked/expired tokens — never another
 * user's document.
 */
async function resolveSharedPRD(token: string): Promise<PRD | null> {
  if (!token || token.length > 64) return null;
  try {
    const link = await prisma.sharedLink.findUnique({
      where: { token },
      include: { prd: true },
    });
    if (!link || !link.isActive) return null;
    if (link.expiresAt && link.expiresAt.getTime() < Date.now()) return null;

    const p = link.prd;
    // content is Json — usually the section map object; tolerate legacy strings.
    let content: PRDContent | null = null;
    if (typeof p.content === 'string') {
      try {
        content = JSON.parse(p.content) as PRDContent;
      } catch {
        content = null;
      }
    } else if (p.content && typeof p.content === 'object' && !Array.isArray(p.content)) {
      content = p.content as unknown as PRDContent;
    }

    return {
      id: p.id,
      user_id: p.userId,
      title: p.title,
      description: p.description,
      status: p.status as PRDStatus,
      content,
      markdown_content: p.markdownContent,
      model_used: p.modelUsed,
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    };
  } catch (err) {
    console.error('[share] token lookup failed:', err);
    return null;
  }
}

function NotFoundCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md rounded-xl border border-border-paper bg-paper-raised p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <Link2Off className="size-6 text-ink-dim" />
        </div>
        <h1 className="text-lg font-bold text-ink">Tautan tidak tersedia</h1>
        <p className="mt-2 text-sm text-ink-dim">
          PRD ini tidak ditemukan, tautannya sudah dicabut, atau masa berlakunya habis.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Buka FORGE
        </Link>
      </div>
    </div>
  );
}

export default async function SharedPRDPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const prd = await resolveSharedPRD(token);
  if (!prd) return <NotFoundCard />;

  const markdown = generateFullMarkdown(prd);
  const sections = PRD_SECTIONS.filter(
    (s) => typeof prd.content?.[s.key] === 'string' && (prd.content?.[s.key] ?? '').trim().length > 0
  );

  return (
    <div className="min-h-screen bg-paper">
      {/* Minimal public header */}
      <header className="sticky top-0 z-40 border-b border-border bg-paper/80 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <Logo size={32} />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ShareExportBar markdown={markdown} title={prd.title} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-xl border border-border-paper bg-paper-raised p-6 shadow-sm sm:p-10 print:border-0 print:shadow-none">
          {/* Document header */}
          <div className="mb-8 border-b border-border-paper pb-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
              <FileText className="size-3.5" />
              Product Requirements Document
            </div>
            <h1 className="text-3xl font-bold text-ink">{prd.title}</h1>
            {prd.description && (
              <p className="mt-2 text-ink-dim">{prd.description}</p>
            )}
            <p className="mt-3 text-xs text-ink-faint">
              Dibuat: {new Date(prd.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              {prd.model_used && ` • Model: ${prd.model_used}`}
            </p>
          </div>

          {/* Sections */}
          {sections.length > 0 ? (
            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.key}>
                  <SharedMarkdown content={prd.content![section.key]} />
                </section>
              ))}
            </div>
          ) : (
            <p className="italic text-ink-dim">Dokumen ini belum memiliki konten.</p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint print:hidden">
          Dibuat dengan{' '}
          <Link href="/" className="text-primary hover:underline">
            FORGE
          </Link>
        </p>
      </main>
    </div>
  );
}
