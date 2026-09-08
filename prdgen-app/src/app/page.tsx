import type { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { CtaBand } from '@/components/landing/CtaBand';
import { Footer } from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Generate PRD dengan AI dalam Hitungan Menit',
  description:
    'Ubah ide produk menjadi PRD lengkap secara streaming, perjelas lewat chat, bagikan lewat tautan, dan ekspor ke PDF. Bahasa Indonesia.',
};

/**
 * Public landing page. Server component; interactivity (scroll reveal, theme
 * toggle) lives in small client islands (Reveal, ThemeToggle).
 */
export default function RootPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
