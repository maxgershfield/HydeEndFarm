/** Holon metadata keys — see docs/PARTNER_REGISTRY_SCHEMA.md */
export const META = {
  partnerRegistryTag: 'partnerRegistryTag',
  partnerRecordType: 'partnerRecordType',
  schemaVersion: 'schemaVersion',
  registryAvatarId: 'registryAvatarId',
} as const

export type PartnerRecordType =
  | 'vintage'
  | 'inventory_lot'
  | 'allocation'
  | 'preorder'
  | 'certificate'
  | 'visit_log'

export interface PartnerClientConfig {
  id: string
  displayName: string
  oasisApiUrl: string
  registryTag: string
  /** Env var name holding service JWT, e.g. OASIS_JWT_HYDE_END */
  serviceJwtEnv?: string
  /** Inline JWT (not recommended in JSON on disk) */
  serviceJwt?: string
  /** Override global REGISTRY_BACKEND for this client */
  registryBackend?: 'oasis' | 'file'
}

export interface HolonLike {
  id?: string
  name?: string
  description?: string
  holonType?: string | number
  parentHolonId?: string
  metadata?: Record<string, unknown>
  metaData?: Record<string, unknown>
  isActive?: boolean
}

export function holonMeta(h: HolonLike): Record<string, unknown> {
  const m = h.metadata ?? h.metaData
  return m && typeof m === 'object' ? { ...m } : {}
}

export function normalizeHolon(raw: unknown): HolonLike | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as HolonLike
  return {
    ...o,
    id: String(o.id ?? ''),
    metadata: holonMeta(o),
  }
}
