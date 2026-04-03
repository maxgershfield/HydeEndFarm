# Hyde End Vineyard — syndicate passport & farm map

- **`passport.html`** — Skybox syndicate passport (Blockade English vineyard background via `worldgen-oasis-demo`).
- **`farm-map/map.html`** — **Ground map** (MapLibre) for **Hyde End Farm Vineyard** and **Brimpton**, UK — adapted from `celestial-cyberspace/playa-map.html` with Playa/Mexico locations removed.
- **`crm-from-guide-messaging/`** — Copy of Pulmón **`guide-messaging`** (Next.js operator dashboard + Telegram bridge proxies). See `crm-from-guide-messaging/README_HYDE_END.md`.
- **`docs/OASIS_WINE_SYNDICATE_PLATFORM.md`** — How to wire OASIS for inventory, allocations, pre-orders, NFT certificates, and CRM.
- **`docs/PARTNER_REGISTRY_SCHEMA.md`** — Holon `metadata` keys (`partnerRegistryTag`, `registryAvatarId`, record types).
- **`partner-api/`** — Configurable Partner API (BFF): `npm run dev`, `GET /v1/syndicate/me`, optional `REGISTRY_BACKEND=file` for local demos. See `partner-api/README.md`.

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

1. Import the GitHub project in [Vercel](https://vercel.com); leave **Root Directory** as `.` (repo root).
2. **Build**: `npm run build` (compiles `partner-api` to `dist/`). **Output**: static files from the repo root (no separate output dir).
3. **Environment variables** (Partner API → OASIS): set at least `OASIS_SERVICE_JWT` or per-client vars from `partner-api/.env.example`. Optional: `PARTNER_REGISTRY_TAG`, `REGISTRY_BACKEND`, `CORS_ORIGIN` (defaults to `*`).
4. On `*.vercel.app`, `passport.html` defaults Partner API base to `https://<your-deployment>.vercel.app/api`. Custom domains: set `window.HYDE_END_PARTNER_API_URL` or use `?partnerApi=https://your-domain/api`.

## OASIS session

JWT is stored under **`hyde_end_vineyard_jwt`** (separate from other demos). Optional overrides: `window.HYDE_END_OASIS_API_URL`, `window.HYDE_END_SKYBOX_URL`.

## Legacy location

The generic vineyard prototype previously lived under `Hitchhikers/Pulmon_Verde/skybox-passport/`; this folder is the Hyde End–branded home.
