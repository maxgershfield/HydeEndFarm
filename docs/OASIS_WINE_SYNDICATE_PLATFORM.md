# Hyde End syndicate · OASIS-backed inventory, certificates & CRM

This document maps how to make the **passport** controls real, keep an **accurate wine / allocation / pre-order registry**, **mint and deliver certificates**, and how the **`crm-from-guide-messaging`** copy fits as an operator console.

---

## 1. Current passport UI (what is mock vs live today)

| Area | Today | Target behaviour |
|------|--------|------------------|
| OASIS sign-in / gate | Real JWT to `api.oasisweb4.com` (or override) | Keep; extend scopes for new holon reads |
| Avatar profile, karma, tiers | Partially from OASIS `get-avatar-detail-by-id` + metadata | Drive **bottles**, **pre-orders**, **tier** from **avatar metadata** or linked **holon IDs** |
| Centre stats (bottles, standing, pre-orders, vintage) | Mostly **mock** in `mockPassport()` | **Read** from registry API or OASIS holon payloads |
| Season stamps / chapter arc | Local arrays + earned set in metadata | **Quest / milestone** completion via `/api/quest/complete` or custom STAR endpoints |
| Syndicate actions (claim, gift, pre-order) | Static quest copy | **Buttons → API routes** (see §4) |
| Activity feed | Mock + optional Telegram bridge | **Append** on-chain events + CRM messages |
| Telegram connect | Optional `guide-telegram-bridge` | Reuse pattern for **“certificate sent”** notifications |
| Farm map link | Static | Already links to map |

---

## 2. Registry model (source of truth)

Use **OASIS STAR holons** (or one Mongo-backed service the ONODE trusts) so the same objects are addressable from passport, CRM, and chain actions.

### 2.1 Recommended holon types (logical)

| Holon / record | Role | Key metadata (examples) |
|----------------|------|-------------------------|
| **Vintage** | One per harvest year | `vintageYear`, `status` (planned \| barrel \| release), `totalBottles`, `skuPrefix` |
| **Inventory lot** | Bonded / cellar stock | `vintageId`, `bottleCount`, `location`, `exciseRef` (if needed) |
| **Syndicate allocation** | Member × vintage contract | `avatarId` or `syndicateMemberId`, `vintageId`, `bottlesAllocated`, `bottlesClaimed`, `giftAllowance` |
| **Pre-order** | Future vintage commitment | `avatarId`, `targetVintage`, `bottleQty`, `depositStatus`, `paidAt` |
| **Certificate NFT** | On-chain proof | `mintAddress`, `metadataUri`, `allocationId`, `templateId` (for “beautiful” PDF/HTML) |

Relationships can be **parent holon IDs** in `metaData` or a small **BFF** that joins holons for the passport.

### 2.2 Avatar metadata (fast path)

Mirror **summary fields** on the member avatar for HUD performance (same pattern as `wineSyndicateTier`, `bottlesReserved` already sketched in `passport.html`):

- `bottlesReserved`, `certificatesHeld`, `giftableCertificates`, `preorderCount`, `vintageYear`, `syndicateId`

A **worker or ONODE hook** updates these when allocations / pre-orders / mints change so the passport does not scan hundreds of holons per page load.

---

## 3. OASIS APIs relevant to tokenised certificates

### 3.1 One NFT per certificate (recommended for “beautiful” metadata + wallets)

- **`POST /api/nft/mint-nft`** — Metaplex-style NFT with `Title`, `Symbol`, `JSONMetaDataURL`, `SendToAddressAfterMinting` or avatar-linked send.  
- **`POST /api/nft/send-nft`** — Transfer to recipient wallet.  
- **Docs:** `Docs/OASIS_TOKEN_TYPES.md`, `Docs/Devs/docs-new/web4-oasis-api/blockchain-wallets/nft-api.md`

**Certificate UX:** host JSON at `JSONMetaDataURL` with high-res image (label art), vintage, bottle numbers, estate legal blurb. Optional: link to **passport deep link** or **map** in `external_url`.

### 3.2 Fungible “bottle rights” (only if you want divisible pool tokens)

- **`POST /api/nft/create-spl-token`** + **`POST /api/nft/mint-tokens`** / **`send-token`** — for **quantity** updates per member.  
- **Not** interchangeable with `mint-nft` for one-of-a-kind certificates — see `Docs/OASIS_TOKEN_TYPES.md` (OwnerMismatch if you mix them up).

### 3.3 Wallets

- **`GET /api/wallet/get-wallets-for-avatar/{avatarId}/{providerType}`** — resolve where to send NFT.  
- **Docs:** `Docs/SPL_TOKEN_ENDPOINTS_REFERENCE.md`

### 3.4 Quests / karma (stamps, standing)

- Existing **`/api/quest/complete`** pattern (as on Pulmón passport ticker) can back **season stamps** when a syndicate action completes (pre-order placed, gift completed, visit logged).

### 3.5 Email / notifications

- If OASIS email hooks exist in your deployment, use them for **“Your certificate is ready”**; else CRM (below) sends Telegram/WhatsApp/email via bridge.

---

## 4. Passport buttons → proposed backend actions

| UI element | Proposed action |
|------------|-----------------|
| **Claim bottle certificates** | `POST /syndicate/claim` (BFF): validate allocation holon → call `mint-nft` (batch or single) → write certificate holon → update avatar metadata |
| **Gift certificate** | `POST /syndicate/gift`: `send-nft` or custody transfer + update `giftableCertificates` |
| **Pre-order next harvest** | `POST /syndicate/preorder`: create pre-order holon + payment record (off-chain or Stripe) + quest complete |
| **Cellar / collection day** | `POST /syndicate/visit` or quest flag for staff CRM |
| **Full record** (modal) | Open panel fed by `load-holon` for linked allocation + certificates |

Implement these as **Next.js API routes** or **ONODE custom controllers** so **secrets** (mint authority paths, bridge tokens) never sit in static HTML.

---

## 5. “Beautiful certificate” delivery

1. **Design** HTML/PDF template (vintage, name, bottle range, QR to `passport.html?demo=1` or wallet viewer).  
2. **Upload** image + JSON to IPFS or HTTPS; set **`JSONMetaDataURL`** on mint.  
3. **Mint** via OASIS `mint-nft` to member wallet.  
4. **Notify** via CRM send path (Telegram/email) with link to explorer + optional PDF attachment from BFF.  
5. **Optional NFC** — Ratsey bags use NFC; same pattern: URL in NFC points to a **resolver** that checks OASIS holon or NFT metadata.

---

## 6. CRM: `crm-from-guide-messaging` (copy of Pulmón `guide-messaging`)

**Location:** `Hyde End Vineyard/crm-from-guide-messaging/`  
**Origin:** `Hitchhikers/Pulmon_Verde/guide-messaging` (Next 14, port 3005).

### 6.1 What you can reuse immediately

| Piece | Use for Hyde End |
|-------|------------------|
| **Next.js app shell** | Dashboard, compose, conversation list, automations pages |
| **`lib/guideTelegramBridge.ts`** | Pattern for **server-side** calls to `/api/guide-telegram/*` (health, send, linked avatars) |
| **API routes** `app/api/guide-telegram/*` | Proxy to **guide-telegram-bridge** with `BRIDGE_ADMIN_TOKEN` — swap copy to “Hyde End syndicate” |
| **`GuideTelegramOutPanel`** | Operator outbound DMs (e.g. “Your certificate minted”, “Pre-order window”) |
| **`lib/api.ts` + `lib/types.ts`** | **Contract** for a messaging backend (`/api/messaging/*`) — today points at **Union**-style WhatsApp API (`NEXT_PUBLIC_UNION_API_URL`) |
| **Conversations / compose / automations** | Rename to **members**; point `api` at your **syndicate CRM BFF** that reads OASIS + Twilio/WhatsApp |

### 6.2 What you must build or rewire

- **Backend implementing `/api/messaging/*`** (or replace `api` base with OASIS-only flows): members = avatars with syndicate flag; conversations = Telegram/phone threads keyed by `avatarId`.  
- **Env** — `.env.example`: `NEXT_PUBLIC_API_URL`, bridge URL, `BRIDGE_ADMIN_TOKEN`, OASIS JWT for server jobs (short-lived, rotated).  
- **Branding** — replace Pulmón moss/gold with Hyde End palette (optional).  
- **Port** — change `3005` if it clashes; document next to passport static server.

### 6.3 Suggested next step (technical)

1. `cd crm-from-guide-messaging && npm install && npm run dev`  
2. Stand up a thin **BFF** (could be more Next routes) that: lists syndicate avatars from OASIS search, shows allocations, triggers mint via server JWT.  
3. Wire **one** passport button end-to-end (e.g. pre-order) before gifting/mint complexity.

---

## 7. Implemented artefacts (Hyde End repo)

| Item | Location |
|------|-----------|
| **Registry schema (v1)** | [`docs/PARTNER_REGISTRY_SCHEMA.md`](PARTNER_REGISTRY_SCHEMA.md) |
| **Partner API (BFF)** | [`partner-api/`](../partner-api/) — Express TS, multi-client, `file` or `oasis` backend |
| **Passport hook** | `passport.html` — `?partnerApi=` or `window.HYDE_END_PARTNER_API_URL` → `GET /v1/syndicate/me` |

## 8. Phased delivery checklist

1. **Schema** — Done in `PARTNER_REGISTRY_SCHEMA.md` (adjust `schemaVersion` when you change fields).  
2. **BFF** — Partner API: OASIS `save-holon` + `load-holons-by-metadata` when `REGISTRY_BACKEND=oasis` + service JWT; optional avatar mirror still TBD (Wizard JWT).  
3. **Passport** — Uses Partner API when configured; else direct OASIS `get-avatar-detail`; else mock.  
4. **Mint** — One `mint-nft` path + metadata template.  
5. **CRM** — Telegram + optional WhatsApp via copied app; link member row to avatar ID.  
6. **Compliance** — Alcohol retail / pre-sales rules (UK) outside OASIS; track consent in holon metadata.

---

## 9. References in this repo

- `Docs/SPL_TOKEN_ENDPOINTS_REFERENCE.md`  
- `Docs/OASIS_TOKEN_TYPES.md`  
- `Docs/HOLONIC_RWA_WHITEPAPER.md` (holon framing)  
- `Hyde End Vineyard/RATSEY_AND_LAPTHORN_RESEARCH.md` (partner context)  
- `Hyde End Vineyard/crm-from-guide-messaging/README_HYDE_END.md` (copy notes)
