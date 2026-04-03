# Hyde End Vineyard — syndicate passport & farm map

- **`passport.html`** — Skybox syndicate passport (Blockade English vineyard background via `worldgen-oasis-demo`).
- **`farm-map/map.html`** — **Ground map** (MapLibre) for **Hyde End Farm Vineyard** and **Brimpton**, UK — adapted from `celestial-cyberspace/playa-map.html` with Playa/Mexico locations removed.
- **`crm-from-guide-messaging/`** — Copy of Pulmón **`guide-messaging`** (Next.js operator dashboard + Telegram bridge proxies). See `crm-from-guide-messaging/README_HYDE_END.md`.
- **`docs/OASIS_WINE_SYNDICATE_PLATFORM.md`** — How to wire OASIS for inventory, allocations, pre-orders, NFT certificates, and CRM.
- **`docs/PARTNER_REGISTRY_SCHEMA.md`** — Holon `metadata` keys (`partnerRegistryTag`, `registryAvatarId`, record types).
- **`partner-api/`** — Configurable Partner API (BFF): `npm run dev`, `GET /v1/syndicate/me`, optional `REGISTRY_BACKEND=file` for local demos. See `partner-api/README.md`.
- **`wine-marketplace/`** — Next.js cellar-door shop (Q2P fork): static English wine catalog, Hyde End styling, cookie cart. See `wine-marketplace/README.md`.

## Run locally

```bash
cd "Hyde End Vineyard"
python3 -m http.server 9876
```

Passport: `http://localhost:9876/passport.html?demo=1` — **English vineyard skybox is built in** (Blockade URL shipped in `passport.html`). Override with `&skyboxUrl=` after a new `demo_blockade_english_vineyard.py` run if you like.

Farm map: `http://localhost:9876/farm-map/map.html`

Map coordinates for Hyde End Lane / RG7 4RJ are **approximate**; use **Edit boundary** on the vineyard marker to drag corners to the real parcel (saved in `localStorage` as `hev-corners-v1`).

Generate the skybox (from repo root):

```bash
cd worldgen-oasis-demo
python demo_blockade_english_vineyard.py
```

Prompt reference: `worldgen-oasis-demo/prompts/english_vineyard_skybox.md`.

## Deploy on Vercel

Repo: [github.com/maxgershfield/HydeEndFarm](https://github.com/maxgershfield/HydeEndFarm).

### Project A — passport + Partner API (repo root)

1. Import the repo in [Vercel](https://vercel.com); **Root Directory** **`.`** (default).
2. **Build**: `npm run build` (compiles `partner-api`, copies static assets into **`public/`**). **Output directory**: `public` (see root `vercel.json`).
3. **Environment variables** (Partner API → OASIS): set at least `OASIS_SERVICE_JWT` or per-client vars from `partner-api/.env.example`. Optional: `PARTNER_REGISTRY_TAG`, `REGISTRY_BACKEND`, `CORS_ORIGIN` (defaults to `*`).
4. **Wine marketplace link** (top bar “Cellar door” on the passport): set **`NEXT_PUBLIC_HYDE_WINE_MARKETPLACE_URL`** to your **Project B** URL (e.g. `https://your-shop.vercel.app`). The build injects it into `passport.html` / `index.html`. Alternatively edit the `<meta name="hyde-wine-marketplace-url">` in `passport.html`, or use `?wineShop=` / `window.HYDE_END_WINE_MARKETPLACE_URL`. On `localhost`, the link defaults to `http://localhost:3000` when unset.
5. On `*.vercel.app`, `passport.html` defaults Partner API base to `https://<your-deployment>.vercel.app/api`. Custom domains: set `window.HYDE_END_PARTNER_API_URL` or use `?partnerApi=https://your-domain/api`.

### Project B — wine marketplace (Next.js)

Create a **separate Vercel project** from the same GitHub repo with **Root Directory** **`wine-marketplace`**. See **`wine-marketplace/README.md`** for step-by-step instructions and env vars (`NEXT_PUBLIC_HYDE_PASSPORT_URL`, etc.). Copy the shop’s production URL into **Project A** as `NEXT_PUBLIC_HYDE_WINE_MARKETPLACE_URL` so the passport shows **Cellar door**.

## OASIS session

JWT is stored under **`hyde_end_vineyard_jwt`** (separate from other demos). Optional overrides: `window.HYDE_END_OASIS_API_URL`, `window.HYDE_END_SKYBOX_URL`.

## Legacy location

The generic vineyard prototype previously lived under `Hitchhikers/Pulmon_Verde/skybox-passport/`; this folder is the Hyde End–branded home.
