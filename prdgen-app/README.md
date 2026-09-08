# FORGE

FORGE — AI PRD Generator: ubah ide produk jadi PRD lengkap, streaming, multi-provider AI, share link, export PDF.

## Features

- **Generate PRD streaming** — ide produk diubah jadi Product Requirements Document lengkap, output muncul real-time per bagian
- **Katalog model multi-provider** — 9Router (default, lokal), AgentRouter, OpenRouter; fallback otomatis antar provider
- **Custom engines (BYOK)** — tambah engine sendiri dengan API key sendiri, diuji langsung via `/api/engines/test`
- **Chat refine** — perbaiki/perluas PRD lewat percakapan kontekstual
- **Mindmap & task board** — struktur rencana divisualisasikan jadi mindmap (Mermaid) dan task list
- **Share links** — PRD bisa dibagikan via token publik tanpa login
- **Export PDF** — PRD di-export jadi PDF rapi (header, footer, page-break aware)
- **Dark/light theme** — theme switcher tanpa flash, tersimpan per-browser
- **Dokumen input multi-format** — paste teks / upload file, di-extract jadi konteks PRD

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router, `--webpack`) |
| UI | React 19, Tailwind CSS 4, shadcn/base-ui, lucide-react |
| Bahasa | TypeScript 5 |
| ORM/DB | Prisma 6, PostgreSQL 17 (Supabase-compatible) |
| Auth | Supabase (optional; dev-mode tanpa Supabase) |
| State/Data | Zustand 5, TanStack Query 5 |
| Markdown/PDF | react-markdown + remark-gfm, rehype-highlight, html2pdf.js |
| Diagram | Mermaid 11 |

## Quick Start

```bash
npm install
cp .env.example .env.local
# isi DATABASE_URL, ENGINE_ENC_SECRET, dan minimal 1 AI provider key
npm run db:push
npm run dev
```

Detail lengkap (Supabase, dev-mode auth, deployment): lihat [SETUP.md](./SETUP.md).

## AI Providers

| Provider | Env | Model | Keterangan |
|----------|-----|-------|------------|
| **9Router** (default) | `NINE_ROUTER_API_KEY`, `NINE_ROUTER_BASE_URL`, `NINE_ROUTER_MODEL` | `Dev-Stack` | Proxy lokal `http://localhost:20128/v1` (recommended); hosted `https://api.9router.com/v1` optional. Model ID free-form. |
| AgentRouter | `AGENTROUTER_API_KEY` | `claude-opus-4-8` (fixed) | https://agentrouter.org |
| OpenRouter | `OPENROUTER_API_KEY` | banyak (GPT, Claude, Gemini, Kimi, DeepSeek, Qwen) | https://openrouter.ai — internal ID di-map ke slug |

Fallback otomatis: 9Router → AgentRouter → OpenRouter.

## Environment Variables

<details>
<summary>Ringkasan (klik untuk buka)</summary>

| Variabel | Fungsi |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_BASE_URL` | Base URL untuk SEO, robots, sitemap, header OpenRouter |
| `DATABASE_URL` / `DIRECT_URL` | Postgres — pooled + direct connection (Supabase atau lokal) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Auth asli; kosong = dev-mode |
| `NINE_ROUTER_API_KEY`, `NINE_ROUTER_BASE_URL`, `NINE_ROUTER_MODEL` | Provider AI utama |
| `AGENTROUTER_API_KEY`, `OPENROUTER_API_KEY` | Provider AI alternatif |
| `ENGINE_ENC_SECRET` | AES-256-GCM untuk enkripsi API key engine tersimpan (wajib) |
| `ALLOW_LOCAL_AI_ENDPOINTS` | `true` = izinkan base URL localhost untuk custom engine (self-hosted single-user saja) |

</details>

## Struktur Proyek

```
src/
├── app/
│   ├── (auth)/login/          # Login (Supabase / dev-mode)
│   ├── (dashboard)/           # dashboard, new, prd/[id] (+preview, chat), workspace
│   ├── (public)/              # blog, share/[token]
│   ├── api/                   # auth, engines (test), extract, plan, prd (generate/refine/chat/share)
│   ├── layout.tsx, page.tsx   # Root layout + landing
│   └── seo.ts, robots.ts, sitemap.ts
├── components/
│   ├── plan/                  # MindmapCanvas, TaskBoard, StepperHeader
│   ├── prd/                   # SectionCard, ShareExportBar, VersionHistory, dll.
│   ├── shared/                # Logo, Navbar, Footer, Sidebar, ThemeProvider
│   └── ui/                    # shadcn components
├── lib/
│   ├── ai/                    # providers, engine registry, streaming
│   ├── supabase/, auth/       # Client/middleware auth
│   ├── crypto.ts, pdf.ts, constants.ts, utils.ts
└── middleware.ts              # Route guard
prisma/schema.prisma           # Skema DB
```

## Security Notes

- **API key engine terenkripsi at-rest** — AES-256-GCM via `ENGINE_ENC_SECRET`; key tidak pernah dikirim balik ke client setelah disimpan
- **SSRF guard** — custom engine endpoint divalidasi; base URL localhost/private IP diblokir kecuali `ALLOW_LOCAL_AI_ENDPOINTS=true` (untuk self-hosted single-user)
- **Dev-mode auth** — tanpa env Supabase app pakai dev login tanpa session guard; jangan deploy production dalam mode ini
- **Route guard** — `/dashboard`, `/new`, `/prd/*`, `/workspace/*` butuh session aktif begitu Supabase terisi

## License

Belum ditentukan — semua hak dilindungi (all rights reserved) sampai lisensi resmi dipilih.

---

**Author:** Raliq Hidayat BM3
