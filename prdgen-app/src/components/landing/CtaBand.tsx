import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Reveal } from './Reveal';

/** Closing CTA band. Green field, paper type, stamp motif. */
export function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="border-t border-border bg-paper-raised">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-lg bg-primary px-6 py-14 text-center sm:px-12 lg:py-20">
            {/* Paper grid texture, tuned for the green field */}
            <div
              aria-hidden
              className="bg-paper-grid mask-fade absolute -inset-x-4 -inset-y-8 opacity-25"
              style={
                {
                  '--border-paper': 'color-mix(in srgb, #ffffff 22%, transparent)',
                } as CSSProperties
              }
            />
            <div className="relative">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary-foreground">
                Mulai
              </p>
              <h2
                id="cta-heading"
                className="mx-auto mt-3 max-w-2xl font-heading text-2xl font-bold tracking-[-0.02em] text-primary-foreground sm:text-3xl lg:text-4xl"
              >
                Dokumen yang membuat tim Anda sejalan.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-primary-foreground">
                Mulai dari satu paragraf ide. PRD lengkap menyusul beberapa menit kemudian,
                siap direvisi, dibagikan, dan diekspor.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/new">
                  <Button
                    size="lg"
                    className="h-11 gap-2 bg-paper px-5 text-ink hover:bg-paper-raised"
                  >
                    Buat PRD Pertama Anda
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <span className="stamp text-primary-foreground/75" aria-hidden>
                  LANGSUNG PAKAI
                </span>
              </div>
              <p className="mt-6 font-mono text-[11px] tracking-wider text-primary-foreground">
                Sudah punya akun?{' '}
                <Link
                  href="/login"
                  className="underline underline-offset-4 transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
