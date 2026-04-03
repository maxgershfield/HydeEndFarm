import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { PartnerClientConfig } from '../types.js'
import { META, type HolonLike, type PartnerRecordType } from '../types.js'
import { holonMeta } from '../types.js'

const DEFAULT_FILE = path.join(process.cwd(), 'data', 'registry.local.json')

interface FileRoot {
  /** partnerId → list of synthetic holons */
  partners: Record<string, HolonLike[]>
}

function emptyRoot(): FileRoot {
  return { partners: {} }
}

function readRoot(filePath: string): FileRoot {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const j = JSON.parse(raw) as FileRoot
    if (!j.partners || typeof j.partners !== 'object') return emptyRoot()
    return j
  } catch {
    return emptyRoot()
  }
}

function writeRoot(filePath: string, root: FileRoot) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(root, null, 2), 'utf8')
}

function filePath(): string {
  return process.env.REGISTRY_FILE_PATH || DEFAULT_FILE
}

function listPartner(client: PartnerClientConfig): HolonLike[] {
  const root = readRoot(filePath())
  return root.partners[client.id] ?? []
}

function savePartner(client: PartnerClientConfig, holons: HolonLike[]) {
  const root = readRoot(filePath())
  root.partners[client.id] = holons
  writeRoot(filePath(), root)
}

function newHolon(
  client: PartnerClientConfig,
  type: PartnerRecordType,
  name: string,
  extraMeta: Record<string, unknown>
): HolonLike {
  const id = randomUUID()
  const metadata: Record<string, unknown> = {
    [META.partnerRegistryTag]: client.registryTag,
    [META.partnerRecordType]: type,
    [META.schemaVersion]: '1.0',
    ...extraMeta,
  }
  return {
    id,
    name,
    holonType: 'Holon',
    metadata,
    isActive: true,
  }
}

export const fileRegistry = {
  filePath,

  async loadForAvatar(client: PartnerClientConfig, avatarId: string) {
    const all = listPartner(client)
    return all.filter((h) => String(holonMeta(h)[META.registryAvatarId] ?? '') === avatarId)
  },

  async loadVintages(client: PartnerClientConfig) {
    const all = listPartner(client)
    return all.filter((h) => holonMeta(h)[META.partnerRecordType] === 'vintage')
  },

  async append(client: PartnerClientConfig, holon: HolonLike) {
    const holons = [...listPartner(client), holon]
    savePartner(client, holons)
    return holon
  },

  async createPreorder(
    client: PartnerClientConfig,
    avatarId: string,
    body: { vintageHolonId?: string; targetVintageYear?: number; qty: number; note?: string }
  ) {
    const holon = newHolon(client, 'preorder', `Preorder · ${body.qty} bottles`, {
      [META.registryAvatarId]: avatarId,
      vintageHolonId: body.vintageHolonId ?? '',
      targetVintageYear: body.targetVintageYear ?? null,
      qty: body.qty,
      depositStatus: 'none',
      note: body.note ?? '',
      createdAt: new Date().toISOString(),
    })
    return fileRegistry.append(client, holon)
  },

  async createVisit(
    client: PartnerClientConfig,
    avatarId: string,
    body: { visitType?: string; note?: string }
  ) {
    const holon = newHolon(client, 'visit_log', `Visit · ${body.visitType || 'event'}`, {
      [META.registryAvatarId]: avatarId,
      visitType: body.visitType || 'cellar_day',
      note: body.note ?? '',
      createdAt: new Date().toISOString(),
    })
    return fileRegistry.append(client, holon)
  },

  /**
   * Increment bottlesClaimed on a matching allocation (file mode demo).
   */
  async claimBottles(
    client: PartnerClientConfig,
    avatarId: string,
    body: { allocationHolonId?: string; bottleQty?: number }
  ) {
    const qty = Math.max(1, Number(body.bottleQty) || 1)
    const holons = listPartner(client)
    const idx = holons.findIndex((h) => {
      const m = holonMeta(h)
      if (m[META.partnerRecordType] !== 'allocation') return false
      if (String(m[META.registryAvatarId]) !== avatarId) return false
      if (body.allocationHolonId && h.id !== body.allocationHolonId) return false
      return true
    })
    if (idx < 0) {
      const err = new Error('No allocation found for this member (seed demo data via POST /v1/admin/seed-demo)')
      ;(err as Error & { status: number }).status = 404
      throw err
    }
    const h = holons[idx]
    const m = { ...holonMeta(h) }
    const alloc = Number(m.bottlesAllocated) || 0
    const claimed = Number(m.bottlesClaimed) || 0
    if (claimed + qty > alloc) {
      const err = new Error('Claim exceeds allocation')
      ;(err as Error & { status: number }).status = 400
      throw err
    }
    m.bottlesClaimed = claimed + qty
    m.updatedAt = new Date().toISOString()
    const updated: HolonLike = { ...h, metadata: m }
    holons[idx] = updated
    savePartner(client, holons)
    return updated
  },

  /** Dev-only: one allocation + one vintage */
  async seedDemo(client: PartnerClientConfig, avatarId: string) {
    const existing = listPartner(client)
    if (existing.length) return { ok: true, message: 'Already seeded', count: existing.length }

    const vintage = newHolon(client, 'vintage', 'Vintage 2026', {
      vintageYear: 2026,
      status: 'planned',
      labelName: 'Hyde End 2026',
      totalBottlesPlanned: 2400,
    })
    const allocation = newHolon(client, 'allocation', `Allocation · member ${avatarId.slice(0, 8)}`, {
      [META.registryAvatarId]: avatarId,
      vintageHolonId: vintage.id,
      bottlesAllocated: 48,
      bottlesClaimed: 0,
      bottlesGiftable: 6,
      contractRef: 'demo',
      updatedAt: new Date().toISOString(),
    })
    savePartner(client, [vintage, allocation])
    return { ok: true, vintageId: vintage.id, allocationId: allocation.id }
  },
}
