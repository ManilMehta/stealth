# CAD PRS Phase-0 Demo

End-to-end genomic risk screening demo (Phase 0). Upload a synthetic 23andMe-style
genotype file, compute a deterministic Coronary Artery Disease (CAD) polygenic risk
score (PRS), view percentile / category / population comparison, get an AI-generated
plain-language explanation, and download a PDF report.

> Phase 0 is a non-clinical demo built to validate UX, investor interest, and report
> presentation. SNP weights and thresholds are illustrative, not medically validated.
> Nothing here is medical advice.

## Stack

- Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS v4 -- single full-stack app
- Supabase (free tier): Auth + Postgres + Storage
- Google Gemini free tier for AI explanations, with a deterministic templated fallback
- `@react-pdf/renderer` for client-side PDF generation
- Vitest for unit/integration tests

Everything runs on free tiers -- $0 to operate.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + (optional) Gemini values
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm test` | Run the Vitest suite |
| `npm run typecheck` | Strict TypeScript check (no emit) |
| `npm run lint` | ESLint |
| `npm run coverage` | Test coverage for the domain/lib core |

## Demo dataset

Three synthetic genotype fixtures live in `fixtures/`:

| File | Expected percentile | Category |
| --- | --- | --- |
| `userA_low.txt` | 15 | Low |
| `userB_average.txt` | 55 | Average |
| `userC_high.txt` | 97 | High |

## Architecture

```
Login/Register -> Upload -> /api/score
  -> Supabase Storage (raw file)
  -> genotype parser (src/domain/parser.ts)
  -> CAD PRS engine (src/domain/prs.ts)
  -> risk categorization (src/domain/risk.ts)
  -> Postgres results row (RLS: owner-only)
  -> Dashboard/Results page
       -> /api/explain (Gemini or templated fallback)
       -> client-side PDF report
```

The PRS model (`src/domain/snpWeights.ts`) and reference distribution are
illustrative constants. The demo fixtures are produced by
`scripts/generate-fixtures.ts`, which searches for genotype assignments that
land on the target percentiles, so the pipeline is fully deterministic.

## Auth note

New Supabase projects require email confirmation. For this demo a database
trigger (`auto_confirm_demo_signups` migration) auto-confirms new signups so
users can register and sign in immediately without SMTP. Remove that trigger
for any real deployment.

## Verification scripts

```bash
# End-to-end Supabase check (auth -> storage -> RLS insert -> read-back):
tsx --env-file=.env.local scripts/verify-pipeline.ts

# Full HTTP E2E against a running server (build + start first):
npm run build && npm start            # terminal 1
tsx --env-file=.env.local scripts/verify-e2e.ts   # terminal 2
```

## Deploy (Vercel, free)

1. Push to GitHub and import the repo in Vercel.
2. Set env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   and optionally `GEMINI_API_KEY`.
3. Deploy. The Supabase project (Postgres + Auth + Storage) is already
   provisioned on the free tier.
