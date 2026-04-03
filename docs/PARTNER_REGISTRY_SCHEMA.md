# Partner registry schema (wine syndicate & RWA-style partners)

Version: **1.0** (adjust freely; bump `schemaVersion` in holon metadata when you migrate).

This schema is the **contract** between:

- OASIS holons (authoritative records),
- the **Partner API** (`partner-api/`),
- passport / CRM UIs.

All registry holons use OASIS **`holonType`: `Holon`** (string) unless you standardise on a numeric enum with your ONODE.

---

## 1. Namespacing (multi-tenant / per client)

Every holon carries:

| `metadata` key | Type | Required | Description |
|----------------|------|----------|-------------|
| `partnerRegistryTag` | string | yes | Stable tenant id, e.g. `hyde_end_v1`. **Must match** the Partner API client config `registryTag`. |
| `partnerRecordType` | string | yes | One of: `vintage`, `inventory_lot`, `allocation`, `preorder`, `certificate`, `visit_log`. |
| `schemaVersion` | string | yes | e.g. `1.0`. |

**Query pattern:** `GET /api/data/load-holons-by-metadata?metaKey=partnerRegistryTag&metaValue={registryTag}&holonType=Holon` then filter in the Partner API by `partnerRecordType` and/or avatar keys below.

**Per-avatar fast queries:** duplicate the avatar id into a dedicated metadata key so OASIS can return only relevant rows without scanning the whole tenant:

| Key | Used on types | Value |
|-----|----------------|--------|
| `registryAvatarId` | `allocation`, `preorder`, `certificate`, `visit_log` | OASIS avatar GUID (string) |

---

## 2. Record types

### 2.1 `vintage`

| Field | Type | Description |
|-------|------|-------------|
| `vintageYear` | number | Harvest year, e.g. `2026`. |
| `status` | string | `planned` \| `growing` \| `barrel` \| `bottled` \| `released` \| `archived`. |
| `labelName` | string | Marketing name. |
| `totalBottlesPlanned` | number \| null | Optional forecast. |
| `totalBottlesActual` | number \| null | After bottling. |
| `syndicateNotes` | string | Internal. |
| `releasedAt` | string (ISO) | Optional. |

**Holon `name`:** e.g. `Vintage 2026`.

---

### 2.2 `inventory_lot`

Bonded / cellar / SKU-level stock (optional granularity).

| Field | Type | Description |
|-------|------|-------------|
| `vintageHolonId` | string | Parent vintage holon id. |
| `bottleCount` | number | Units in this lot. |
| `locationCode` | string | Cellar / site code. |
| `sku` | string | Optional. |
| `exciseRef` | string | Optional compliance ref. |

---

### 2.3 `allocation`

Syndicate contract: member × vintage (or × product line).

| Field | Type | Description |
|-------|------|-------------|
| `registryAvatarId` | string | Member avatar id. |
| `vintageHolonId` | string | Which vintage. |
| `bottlesAllocated` | number | Contracted bottles. |
| `bottlesClaimed` | number | Certificates minted / claimed. |
| `bottlesGiftable` | number | Policy: how many transfers allowed. |
| `contractRef` | string | Optional external ref. |
| `updatedAt` | string (ISO) | Last change. |

**Rules (enforced in Partner API):** `bottlesClaimed <= bottlesAllocated`; gifts draw from `bottlesGiftable` / policy.

---

### 2.4 `preorder`

| Field | Type | Description |
|-------|------|-------------|
| `registryAvatarId` | string | |
| `vintageHolonId` | string | Optional if pre-ordering “next” vintage. |
| `targetVintageYear` | number | Optional when `vintageHolonId` unknown. |
| `qty` | number | Bottles. |
| `depositStatus` | string | `none` \| `pending` \| `paid` \| `refunded`. |
| `note` | string | Optional. |
| `createdAt` | string (ISO) | |

---

### 2.5 `certificate`

Logical record (NFT mint fills `mintAddress` later).

| Field | Type | Description |
|-------|------|-------------|
| `registryAvatarId` | string | Current owner avatar. |
| `allocationHolonId` | string | Optional link to allocation. |
| `vintageHolonId` | string | |
| `templateId` | string | e.g. `hyde_end_cert_v1` for PDF/HTML. |
| `metadataUri` | string | NFT JSON metadata URL. |
| `mintAddress` | string | Solana mint / chain-specific id. |
| `chain` | string | e.g. `solana`. |
| `issuedAt` | string (ISO) | |

---

### 2.6 `visit_log`

| Field | Type | Description |
|-------|------|-------------|
| `registryAvatarId` | string | |
| `visitType` | string | e.g. `cellar_day`, `collection`, `tour`. |
| `note` | string | |
| `createdAt` | string (ISO) | |

---

## 3. Avatar metadata mirror (HUD / passport)

Optional denormalised fields on **avatar detail** `metadata` / `metaData` (names align with `passport.html`):

| Key | Type | Description |
|-----|------|-------------|
| `wineSyndicateTier` | string | `seed` \| `root` \| `vine` \| `cellar` \| `custodian` (or your tier set). |
| `bottlesReserved` | number | Syndicate bottles (HUD “trees” slot). |
| `certificatesHeld` | number | NFT count or logical certs. |
| `giftableCertificates` | number | |
| `preorderCount` | number | Open pre-orders. |
| `vintageYear` | string | Display label for current vintage focus. |
| `syndicateId` | string | Display id, e.g. `HYDE-END-01`. |
| `lastActivity` | string | Short human line for “last check-in”. |

**Note:** Updating another user’s avatar requires **Wizard** (or equivalent) on OASIS. The Partner API can **compute** these fields in `GET /v1/syndicate/me` without persisting, or persist using a **service** JWT with sufficient privilege.

---

## 4. Partner API ↔ OASIS endpoints

| Action | OASIS |
|--------|--------|
| Load holons by tag | `GET /api/data/load-holons-by-metadata?metaKey=partnerRegistryTag&metaValue=...&holonType=Holon` |
| Load holons for avatar | `GET /api/data/load-holons-by-metadata?metaKey=registryAvatarId&metaValue={avatarId}&holonType=Holon` |
| Create / update holon | `POST /api/data/save-holon` |
| Member profile | `GET /api/avatar/get-logged-in-avatar`, `GET /api/avatar/get-avatar-detail-by-id/{id}` (Bearer **user** JWT) |
| Mirror patch | `POST /api/avatar/update-avatar-detail-by-id/{id}` (Bearer **user** or Wizard service JWT) |

---

## 5. Changelog

- **1.0** — Initial registry types + `registryAvatarId` + `partnerRegistryTag`.
