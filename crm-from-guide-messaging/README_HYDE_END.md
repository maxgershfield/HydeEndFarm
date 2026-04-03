# Hyde End CRM starter (from `guide-messaging`)

This folder is a **copy** of `Hitchhikers/Pulmon_Verde/guide-messaging` (Pulmón Verde operator UI), **without** `node_modules`, `.next`, or **`.env.local`** (never commit tokens — create your own from `.env.example`).

## Origin

- **Upstream:** Pulmón Verde — Telegram dashboard + optional Union WhatsApp API client.
- **Copied:** source only; run `npm install` locally.

## What’s inside

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Dashboard, bridge health, links to compose / conversations |
| `app/compose/` | Send flow |
| `app/conversations/` | Thread list + detail routes |
| `app/automations/` | Automation toggles (expects `/api/messaging/automations`) |
| `app/api/guide-telegram/*` | Server proxies to **guide-telegram-bridge** |
| `app/api/chatbridge/*` | Alternate bridge routes |
| `lib/guideTelegramBridge.ts` | Client helpers (health, send, linked OASIS avatars) |
| `lib/api.ts` | **Union-style** REST client → `NEXT_PUBLIC_UNION_API_URL` or `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`) |

## Reuse for Hyde End

1. **Telegram** — Keep bridge pattern; retitle strings to Hyde End; send “certificate minted”, “pre-order window”, etc.
2. **WhatsApp / members** — Either deploy a backend that implements the same `/api/messaging/*` contract as Union’s union-messaging, **or** replace `lib/api.ts` with calls to your **OASIS BFF** (list avatars, allocations).
3. **OASIS** — Add API routes that use server env `OASIS_JWT` or service user to read/update holons; never expose mint keys to the browser.

## Run

```bash
cd crm-from-guide-messaging
npm install
npm run dev
# opens on port 3005 (see package.json)
```

## Env (typical)

See `.env.example` if present in upstream; set:

- `BRIDGE_ADMIN_TOKEN` — for guide-telegram API routes  
- `NEXT_PUBLIC_UNION_API_URL` — only if using WhatsApp member/conversation backend  

---

Full architecture: `../docs/OASIS_WINE_SYNDICATE_PLATFORM.md`.
