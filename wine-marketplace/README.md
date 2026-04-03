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

## Deploy on Vercel (same repo as passport)

Use a **second Vercel project** linked to [HydeEndFarm](https://github.com/maxgershfield/HydeEndFarm) so the Next app is not mixed with the root static + `api/` deployment.

1. [Vercel Dashboard](https://vercel.com/new) → **Add New…** → **Project** → Import **HydeEndFarm**.
2. **Root Directory**: set to **`wine-marketplace`** (Expand “Root Directory” and edit).
3. **Framework Preset**: Next.js (auto-detected). `vercel.json` in this folder pins `npm install` + `npm run build`.
4. **Environment variables** (optional but recommended):
   - `NEXT_PUBLIC_HYDE_PASSPORT_URL` — your main Hyde deployment URL, e.g. `https://hyde-end-farm.vercel.app/` or `https://hyde-end-farm.vercel.app/passport.html` (navbar/footer “Passport” links).
   - `SITE_NAME` — e.g. `Hyde End Cellar Door`.
5. Deploy. The shop will get its own `*.vercel.app` URL.

**CORS / cookies**: the cart cookie is scoped to the shop’s domain. The passport on another subdomain will not share that cookie (expected).

## Legal

Wine imagery is from [Unsplash](https://unsplash.com/) (license per photographer). Product text is **demo copy** — replace with real labels, pricing, and compliance (age verification, UK duty) before production.
