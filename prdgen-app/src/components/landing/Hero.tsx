import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorMock } from './EditorMock';

/** Asymmetric hero: editorial copy left, CSS-composed editor mock right. */
export function Hero() {
  return (
    <section className="relative overflow-x-clip" aria-labelledby="hero-heading">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6 lg:px-8 lg:pb-32 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Copy column */}
          <div>
            <p className="stagger-reveal stagger-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              Generator PRD dengan AI
            </p>
            <h1
              id="hero-heading"
              className="stagger-reveal stagger-2 mt-4 max-w-xl font-heading text-[2.35rem] font-bold leading-[1.08] tracking-[-0.025em] text-ink sm:text-5xl lg:text-[3.4rem]"
            >
              Ubah ide produk menjadi <span className="text-accent">PRD lengkap</span> dalam
              hitungan menit.
            </h1>
            <p className="stagger-reveal stagger-3 mt-5 max-w-xl text-[15px] leading-relaxed text-ink-dim sm:text-base">
              AI menulis setiap bagian dokumen secara streaming. Perjelas lewat chat, bagikan
              lewat tautan, ekspor ke PDF. Semua berawal dari satu paragraf ide.
            </p>
            <div className="stagger-reveal stagger-4 mt-8 flex flex-wrap items-center gap-3">
              <Link href="/new">
                <Button size="lg" className="btn-goo h-11 gap-2 px-5">
                  Mulai Buat PRD
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 border-border px-5 text-ink hover:bg-[var(--accent-soft)] hover:text-accent"
                >
                  Masuk
                </Button>
              </Link>
            </div>
            <p className="stagger-reveal stagger-5 mt-6 font-mono text-[11px] uppercase tracking-wider text-ink-dim">
              Streaming per bagian &middot; 17 bagian terstruktur &middot; Ekspor PDF
            </p>
          </div>

          {/* Visual anchor column */}
          <div className="stagger-reveal stagger-5 relative mx-auto w-full max-w-[440px] lg:mx-0 lg:max-w-none">
            <div
              aria-hidden
              className="mask-fade bg-paper-grid absolute -inset-x-6 -inset-y-10 -z-10 opacity-60"
            />
            <EditorMock />
          </div>
        </div>
      </div>
    </section>
  );
}
