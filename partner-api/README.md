# OASIS Partner API (configurable BFF)

Small **Express + TypeScript** service that acts as a **Partner API**: one codebase, **multiple clients** via `config/clients.json` or env, each with its own `registryTag` and optional OASIS service JWT.

## What it does

- **`GET /v1/syndicate/me`** — Uses the **caller’s OASIS JWT** to resolve the avatar, loads registry holons (OASIS or local file), returns a **`passport`** object for the Hyde End `passport.html` HUD plus a **`partner`** block (allocations, pre-orders, certificates, etc.).
- **`POST /v1/syndicate/preorder`** — Creates a preorder record.
- **`POST /v1/syndicate/claim`** — Updates `bottlesClaimed` on an allocation (NFT mint is a separate step).
- **`POST /v1/syndicate/visit`** — Logs a visit holon.
- **`GET /v1/clients`** — Public list of configured partner ids (no secrets).
- **`POST /v1/admin/seed-demo`** — File backend only: creates demo vintage + allocation for an `avatarId` (requires `X-Admin-Key`).

## Schema

See **[`../docs/PARTNER_REGISTRY_SCHEMA.md`](../docs/PARTNER_REGISTRY_SCHEMA.md)** for `metadata` keys and record types.

## Quick start (local file registry, no OASIS JWT)

```bash
cd partner-api
cp .env.example .env
# Ensure REGISTRY_BACKEND=file
npm install
npm run dev
```

Seed demo data (replace `AVATAR_GUID` with a real OASIS avatar id after you sign in once and read it from the passport, or use any UUID for purely local UI):

```bash
curl -s -X POST http://127.0.0.1:8788/v1/admin/seed-demo \
  -H "Content-Type: application/json" \
  -H "X-Partner-Id: hyde_end" \
  -H "X-Admin-Key: YOUR_PARTNER_ADMIN_KEY" \
  -d '{"avatarId":"00000000-0000-0000-0000-000000000001"}'
```

Set `PARTNER_ADMIN_KEY` in **`.env`** (gitignored). Use that value as header `X-Admin-Key` when calling `POST /v1/admin/seed-demo`. Generate a new key anytime with:  
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Passport wiring

Open the static passport with:

`passport.html?partnerApi=http://127.0.0.1:8788&partnerId=hyde_end`

Or set `window.HYDE_END_PARTNER_API_URL` / `window.HYDE_END_PARTNER_ID` before load.

## Multi-client config

1. Copy `config/clients.example.json` → `config/clients.json` (gitignored locally if you prefer).
2. Set `PARTNER_CLIENTS_PATH=./config/clients.json` in `.env`.
3. Per client, set `serviceJwtEnv` to the name of an env var holding that estate’s **service** JWT (OASIS Wizard / delegated account), or use **`registryBackend": "file"`** for demos.

## Production (OASIS backend)

- Set `REGISTRY_BACKEND=oasis` (default).
- Provide `OASIS_SERVICE_JWT` (or per-client `serviceJwtEnv`).
- Holons must use `partnerRegistryTag` and `registryAvatarId` as in the schema doc.

## Headers

| Header | Purpose |
|--------|---------|
| `Authorization: Bearer <token>` | **User** OASIS JWT (same as passport). |
| `X-Partner-Id` | Which client from `clients.json` (defaults to first client). |
| `X-Admin-Key` | Operator-only routes (`seed-demo`). |
