# Hyde End Cellar Door — wine marketplace

Next.js storefront cloned from **The Union / Q2P** (`storefront/`), restyled to match **Hyde End Farm Vineyard** (passport palette: moss, gold, void) and stocked with a **static English wine catalog** (no Medusa required for browsing or cart).

## Run locally

```bash
cd "wine-marketplace"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Cart uses an HTTP-only cookie (`hydeCart`).

## What changed vs Q2P

- **Products**: six Hyde End wines (handles like `hyde-end-chardonnay-2023`) with Unsplash imagery; **no** apparel.
- **Cart**: local cookie-backed cart (`lib/hyde-cart.ts`), not Medusa line items.
- **Catalog / menu**: `HYDE_MARKETPLACE` in `lib/medusa/index.ts` short-circuits product APIs to `lib/hyde-wine-catalog.ts`.
- **Checkout**: still calls Medusa checkout routes if configured; order summary reads Hyde cart lines when present. For a full production flow, wire Stripe or Medusa with real SKUs.
- **Branding**: Libre Baskerville + DM Sans, vineyard copy, navbar/footer.

## Deploy (e.g. Vercel)

Set root directory to `wine-marketplace` (or this folder if the repo is only the shop). Add `NEXT_PUBLIC_HYDE_PASSPORT_URL` if the passport lives on another URL.

## Legal

Wine imagery is from [Unsplash](https://unsplash.com/) (license per photographer). Product text is **demo copy** — replace with real labels, pricing, and compliance (age verification, UK duty) before production.
