'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { generateFullMarkdown, copyToClipboard, downloadMarkdown } from '@/lib/export';
import { PRD_SECTIONS } from '@/types';
import type { PRD } from '@/types';

export default function PRDPreviewPage() {
  const params = useParams();
  const prdId = params.id as string;

  // Real data from the DB (same endpoint the editor uses).
  const [prd, setPrd] = useState<PRD | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/prd/${prdId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setPrd(json?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setPrd(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [prdId]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-24">
        <p className="font-mono text-sm text-ink-faint">Memuat preview…</p>
      </div>
    );
  }

  if (!prd) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-lg font-bold text-ink">PRD tidak ditemukan</h1>
        <p className="mt-2 text-sm text-ink-dim">Dokumen mungkin sudah dihapus atau bukan milikmu.</p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const markdown = generateFullMarkdown(prd);

  async function handleCopy() {
    const ok = await copyToClipboard(markdown);
    toast.add({ title: ok ? 'Tersalin!' : 'Gagal menyalin', type: ok ? 'success' : 'error' });
  }

  function handleDownload() {
    downloadMarkdown(markdown, `${prd!.title.replace(/\s+/g, '-').toLowerCase()}.md`);
    toast.add({ title: 'Download dimulai', type: 'info' });
  }

  return (
    <div className="mx-auto max-w-4xl pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" render={<Link href={`/prd/${prdId}`} />}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-lg font-bold text-ink">Preview: {prd.title}</h1>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
          <Copy className="size-3.5" />
          Copy
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
          <Download className="size-3.5" />
          Download .md
        </Button>
      </div>

      {/* Content */}
      <div className="rounded-xl border bg-paper-raised p-6 sm:p-10 print:border-none print:p-0">
        <article className="markdown-body max-w-none text-ink">
          <h1>{prd.title}</h1>
          {prd.content &&
            PRD_SECTIONS.map(({ key }) => {
              const body = prd.content![key];
              if (!body) return null;
              return (
                <section key={key}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {body}
                  </ReactMarkdown>
                </section>
              );
            })}
          {!prd.content && (
            <p className="italic text-ink-dim">PRD ini belum memiliki konten.</p>
          )}
        </article>
      </div>
    </div>
  );
}
