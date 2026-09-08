import { Lightbulb, Cpu, FileCheck2 } from 'lucide-react';
import { Reveal } from './Reveal';

const STEPS = [
  {
    icon: Lightbulb,
    no: '01',
    title: 'Tulis ide',
    body: 'Satu paragraf cukup. Sebutkan produk, masalah yang dipecahkan, dan siapa penggunanya. Bisa juga lampirkan berkas pendukung.',
  },
  {
    icon: Cpu,
    no: '02',
    title: 'AI menulis, Anda saksikan',
    body: 'PRD tersusun per bagian secara streaming. Pilih model sesuai kebutuhan kecepatan atau kualitas dari katalog yang tersedia.',
  },
  {
    icon: FileCheck2,
    no: '03',
    title: 'PRD siap dibagikan',
    body: 'Perjelas hasil lewat chat, lalu bagikan lewat tautan publik atau ekspor ke PDF. Dokumen tinggal dipakai tim Anda.',
  },
] as const;

/** "Cara Kerja": 3 steps on one connected rail, not a card grid. */
export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="border-t border-border bg-paper-raised">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              Cara Kerja
            </p>
            <h2
              id="how-heading"
              className="mt-3 font-heading text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl"
            >
              Dari ide ke dokumen, tiga langkah.
            </h2>
          </div>
        </Reveal>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8 lg:mt-16 lg:gap-10">
          {STEPS.map((step, i) => (
            <li key={step.no} className="relative">
              <Reveal delay={i * 90}>
                {/* Dashed rail linking steps at icon height (sm+, not on last) */}
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-12 top-[21px] -right-8 hidden border-t border-dashed border-border sm:block lg:-right-10"
                  />
                )}
                <div className="relative">
                  <span className="relative z-10 flex size-11 items-center justify-center rounded-md border border-border bg-paper text-accent">
                    <step.icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
                    Langkah {step.no}
                  </p>
                  <h3 className="mt-2 font-heading text-lg font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-dim">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
