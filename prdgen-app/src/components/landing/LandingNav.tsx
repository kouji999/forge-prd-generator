import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';

/** Slim sticky top bar for the landing page: logo + Masuk + Mulai. */
export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-paper/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Beranda"
          className="flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Logo size={28} />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/login"
            className="rounded-md px-2 py-1.5 text-sm font-medium text-ink-dim transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Masuk
          </Link>
          <ThemeToggle />
          <Link href="/new">
            <Button className="btn-goo px-3.5">Mulai</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
