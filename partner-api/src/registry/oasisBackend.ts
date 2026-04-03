import type { PartnerClientConfig } from '../types.js'
import { META, type HolonLike, type PartnerRecordType } from '../types.js'
import { holonMeta } from '../types.js'
import {
  loadHolonsByMetadata,
  partitionByRecordType,
  saveHolon,
} from '../oasis/client.js'

const NULL_ID = '00000000-0000-0000-0000-000000000000'

export function oasisRegistry(serviceJwt: string) {
  async function loadForAvatar(client: PartnerClientConfig, avatarId: string): Promise<HolonLike[]> {
    if (!serviceJwt) throw new Error('OASIS_SERVICE_JWT (or per-client serviceJwtEnv) required for oasis backend')
    const base = client.oasisApiUrl
    return loadHolonsByMetadata(base, serviceJwt, META.registryAvatarId, avatarId, 'Holon')
  }

  return {
    loadForAvatar,

    async loadVintages(client: PartnerClientConfig): Promise<HolonLike[]> {
      if (!serviceJwt) throw new Error('OASIS service JWT required')
      const base = client.oasisApiUrl
      const all = await loadHolonsByMetadata(
        base,
        serviceJwt,
        META.partnerRegistryTag,
        client.registryTag,
        'Holon'
      )
      return all.filter((h) => holonMeta(h)[META.partnerRecordType] === 'vintage')
    },

    async createPreorder(
      client: PartnerClientConfig,
      avatarId: string,
      body: { vintageHolonId?: string; targetVintageYear?: number; qty: number; note?: string }
    ): Promise<HolonLike> {
      if (!serviceJwt) throw new Error('OASIS service JWT required')
      const metadata: Record<string, unknown> = {
        [META.partnerRegistryTag]: client.registryTag,
        [META.partnerRecordType]: 'preorder' satisfies PartnerRecordType,
        [META.schemaVersion]: '1.0',
        [META.registryAvatarId]: avatarId,
        vintageHolonId: body.vintageHolonId ?? '',
        targetVintageYear: body.targetVintageYear ?? null,
        qty: body.qty,
        depositStatus: 'none',
        note: body.note ?? '',
        createdAt: new Date().toISOString(),
      }
      return saveHolon(client.oasisApiUrl, serviceJwt, {
        id: NULL_ID,
        name: `Preorder · ${body.qty} bottles`,
        holonType: 'Holon',
        metadata,
        isActive: true,
      })
    },

    async createVisit(
      client: PartnerClientConfig,
      avatarId: string,
      body: { visitType?: string; note?: string }
    ): Promise<HolonLike> {
      if (!serviceJwt) throw new Error('OASIS service JWT required')
      const metadata: Record<string, unknown> = {
        [META.partnerRegistryTag]: client.registryTag,
        [META.partnerRecordType]: 'visit_log',
        [META.schemaVersion]: '1.0',
        [META.registryAvatarId]: avatarId,
        visitType: body.visitType || 'cellar_day',
        note: body.note ?? '',
        createdAt: new Date().toISOString(),
      }
      return saveHolon(client.oasisApiUrl, serviceJwt, {
        id: NULL_ID,
        name: `Visit · ${body.visitType || 'event'}`,
        holonType: 'Holon',
        metadata,
        isActive: true,
      })
    },

    async claimBottles(
      client: PartnerClientConfig,
      avatarId: string,
      body: { allocationHolonId?: string; bottleQty?: number }
    ): Promise<HolonLike> {
      if (!serviceJwt) throw new Error('OASIS service JWT required')
      const qty = Math.max(1, Number(body.bottleQty) || 1)
      const rows = await loadForAvatar(client, avatarId)
      const part = partitionByRecordType(rows)
      let alloc = body.allocationHolonId
        ? part.allocation.find((a) => a.id === body.allocationHolonId)
        : part.allocation[0]
      if (!alloc) {
        const err = new Error('No allocation holon for this member')
        ;(err as Error & { status: number }).status = 404
        throw err
      }
      const m = { ...holonMeta(alloc) }
      const max = Number(m.bottlesAllocated) || 0
      const claimed = Number(m.bottlesClaimed) || 0
      if (claimed + qty > max) {
        const err = new Error('Claim exceeds allocation')
        ;(err as Error & { status: number }).status = 400
        throw err
      }
      m.bottlesClaimed = claimed + qty
      m.updatedAt = new Date().toISOString()
      const id = alloc.id || NULL_ID
      return saveHolon(client.oasisApiUrl, serviceJwt, {
        id,
        name: alloc.name || 'Allocation',
        description: alloc.description,
        holonType: alloc.holonType ?? 'Holon',
        parentHolonId: alloc.parentHolonId,
        metadata: m,
        isActive: alloc.isActive !== false,
      })
    },
  }
}
