import { Check, MessageSquare } from 'lucide-react';

/**
 * Hero visual anchor: a CSS-composed mock of the app's PRD editor.
 * Mirrors SectionCard's vocabulary (perf-ticket, mono stamps, ink/paper
 * tokens) at a small scale. Static content, no images. Decorative: aria-hidden.
 */

const DONE_SECTIONS = [
  { no: '01', title: 'Executive Summary', lines: 3 },
  { no: '02', title: 'Problem Statement', lines: 2 },
];

const STREAMED_TEXT =
  'Metrik keberhasilan diukur melalui retensi pengguna aktif mingguan, waktu onboarding di bawah sepuluh menit, dan NPS target 45 dalam enam bulan pertama.';

/** One sidebar TOC row, like the editor's section list. */
function TocRow({
  no,
  label,
  state,
}: {
  no: string;
  label: string;
  state: 'done' | 'streaming' | 'queued';
}) {
  return (
    <li
      className={
        'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ' +
        (state === 'streaming'
          ? 'bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-accent'
          : 'text-ink-faint')
      }
    >
      {state === 'done' ? (
        <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full border border-accent/60 text-accent" aria-hidden>
          <Check className="size-2" strokeWidth={3.5} />
        </span>
      ) : (
        <span className="size-3.5 shrink-0 rounded-full border border-current opacity-50" aria-hidden />
      )}
      <span className={state === 'done' ? 'text-ink-dim' : ''}>
        {no} {label}
      </span>
      {state === 'streaming' && (
        <span className="ml-auto size-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none" aria-hidden />
      )}
    </li>
  );
}

export function EditorMock() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[420px] select-none">
      {/* Paper card with the app's editor layout */}
      <div className="perf-ticket relative rounded-lg bg-paper-raised p-4 pl-5 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_40px_-16px_color-mix(in_srgb,var(--ink)_28%,transparent)]">
        {/* Title row */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-bold text-ink">
              PRD: Aplikasi Kasir Warung Kopi
            </p>
            <p className="mt-0.5 font-mono text-[10px] tracking-wider text-ink-faint">
              9ROUTER / GEMINI-2.5-PRO
            </p>
          </div>
          <span className="stamp shrink-0 text-accent">LIVE</span>
        </div>

        <div className="flex gap-3">
          {/* Section sidebar / TOC */}
          <nav className="hidden w-32 shrink-0 sm:block">
            <ul className="space-y-1 border-r border-border pr-2">
              <TocRow no="01" label="Exec. Summary" state="done" />
              <TocRow no="02" label="Problem" state="done" />
              <TocRow no="03" label="Goals" state="streaming" />
              <TocRow no="04" label="Personas" state="queued" />
              <TocRow no="05" label="Features" state="queued" />
              <TocRow no="06" label="Roadmap" state="queued" />
            </ul>
          </nav>

          {/* Document pane */}
          <div className="min-w-0 flex-1 space-y-2.5">
            {DONE_SECTIONS.map((s) => (
              <div key={s.no} className="rounded-md border border-border/60 bg-paper p-2.5">
                <p className="mb-1.5 text-[11px] font-semibold text-ink">
                  <span className="mr-1 font-mono text-[10px] text-ink-faint">{s.no}</span>
                  {s.title}
                </p>
                <div className="space-y-1">
                  {Array.from({ length: s.lines }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-[1px] bg-ink/10 dark:bg-ink/15"
                      style={{ width: `${92 - i * 14}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Streaming section */}
            <div className="rounded-md border border-accent/45 bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] p-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-ink">
                  <span className="mr-1 font-mono text-[10px] text-ink-faint">03</span>
                  Goals &amp; Success Metrics
                </p>
                <span className="font-mono text-[9px] uppercase tracking-wider text-accent">
                  menulis&#8230;
                </span>
              </div>
              <p className="text-[11px] leading-snug text-ink-dim">
                {STREAMED_TEXT.slice(0, 64)}
                <span className="text-ink">{STREAMED_TEXT.slice(64)}</span>
                <span className="ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 animate-pulse bg-accent motion-reduce:animate-none" />
              </p>
            </div>
          </div>
        </div>

        {/* Progress foot */}
        <div className="mt-3 flex items-center gap-2.5 border-t border-border pt-2.5">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[18%] rounded-full bg-accent" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-ink-dim [font-variant-numeric:tabular-nums]">
            3/17 bagian
          </span>
        </div>
      </div>

      {/* Floating chat-refinement chip, evokes the refine panel */}
      <div className="absolute -bottom-4 -left-3 hidden items-center gap-2 rounded-lg border border-border bg-paper-raised px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_24px_-10px_color-mix(in_srgb,var(--ink)_30%,transparent)] sm:flex">
        <span className="flex size-6 items-center justify-center rounded-md bg-[var(--accent-soft)] text-accent">
          <MessageSquare className="size-3.5" />
        </span>
        <div className="text-[11px] leading-tight">
          <p className="font-semibold text-ink">Perhalus lewat chat</p>
          <p className="text-ink-faint">&ldquo;Tambahkan metrik retensi di Goals&rdquo;</p>
        </div>
      </div>
    </div>
  );
}
