import {
  Cpu,
  Gauge,
  MessageSquareText,
  Network,
  Share2,
  FileDown,
  GitBranch,
  KeyRound,
  Languages,
} from 'lucide-react';
import { Reveal } from './Reveal';

/**
 * Feature list. Real capabilities only. Two-tier hierarchy: 3 headline
 * features with more copy + 6 compact ones, separated by hairlines inside
 * one panel (anti-slop: no identical card grid with drop shadows).
 */

const PRIMARY = [
  {
    icon: MessageSquareText,
    title: 'Refinement lewat chat',
    body: 'Setelah PRD jadi, ajukan revisi lewat percakapan. AI menulis ulang bagian yang diminta tanpa mengubah bagian lain.',
  },
  {
    icon: Cpu,
    title: 'Multi-provider, pilih sendiri',
    body: '9Router sebagai default, OpenRouter dan AgentRouter sebagai alternatif. Tambahkan engine BYOK Anda sendiri untuk kontrol penuh.',
  },
  {
    icon: Network,
    title: 'Mindmap struktur produk',
    body: 'Rencana divisualisasikan sebagai mindmap: fitur, sub-fitur, dan fase rilis terlihat sekali pandang.',
  },
] as const;

const SECONDARY = [
  { icon: Gauge, label: 'Katalog model dengan indikator kecepatan dan kualitas' },
  { icon: Share2, label: 'Tautan bagikan publik dengan token untuk setiap PRD' },
  { icon: FileDown, label: 'Ekspor PRD ke PDF siap kirim' },
  { icon: GitBranch, label: 'Sejarah versi dokumen' },
  { icon: KeyRound, label: 'API key tersimpan terenkripsi' },
  { icon: Languages, label: 'Antarmuka penuh Bahasa Indonesia' },
] as const;

export function Features() {
  return (
    <section aria-labelledby="features-heading" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              Yang Anda Dapat
            </p>
            <h2
              id="features-heading"
              className="mt-3 font-heading text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl"
            >
              Satu ruang kerja untuk seluruh dokumen.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Bukan hanya generator sekali jalan. FORGE mendampingi dokumen dari draf
              pertama sampai dibagikan ke tim.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-12 overflow-hidden rounded-lg border border-border bg-paper-raised lg:mt-16">
            {/* Primary tier: 3 columns with hairline separators */}
            <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {PRIMARY.map((f) => (
                <div key={f.title} className="p-6 lg:p-8">
                  <span className="flex size-9 items-center justify-center rounded-md border border-border bg-paper text-accent">
                    <f.icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-heading text-base font-semibold text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-dim">{f.body}</p>
                </div>
              ))}
            </div>

            {/* Secondary tier: compact checklist rows */}
            <ul className="grid gap-x-8 border-t border-border px-6 py-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
              {SECONDARY.map((f) => (
                <li
                  key={f.label}
                  className="flex items-start gap-2.5 py-2.5 text-sm text-ink-dim"
                >
                  <f.icon className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} />
                  <span className="leading-snug">{f.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
