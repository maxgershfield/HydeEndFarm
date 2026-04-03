import type { HolonLike } from '../types.js'
import { holonMeta, normalizeHolon } from '../types.js'

interface OasisEnvelope<T> {
  result?: { result?: T } | T | null
  isError?: boolean
  message?: string | null
}

export function unwrapOasis<T>(data: OasisEnvelope<T>): T {
  if (data.isError) throw new Error(data.message || 'OASIS isError')
  const r = data.result as { result?: T } | T | null | undefined
  if (r && typeof r === 'object' && 'result' in r && (r as { result: T }).result !== undefined)
    return (r as { result: T }).result
  return r as T
}

export async function oasisFetchJson<T>(
  baseUrl: string,
  jwt: string,
  method: 'GET' | 'POST',
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (jwt) headers.Authorization = `Bearer ${jwt}`

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = (await res.json().catch(() => ({}))) as OasisEnvelope<T>
  if (!res.ok) {
    throw new Error(data.message || `${method} ${path} → HTTP ${res.status}`)
  }
  return unwrapOasis<T>(data)
}

export async function getLoggedInAvatar(baseUrl: string, userJwt: string): Promise<Record<string, unknown>> {
  return oasisFetchJson<Record<string, unknown>>(baseUrl, userJwt, 'GET', '/api/avatar/get-logged-in-avatar')
}

export async function getAvatarDetailById(
  baseUrl: string,
  userJwt: string,
  avatarId: string
): Promise<Record<string, unknown>> {
  return oasisFetchJson<Record<string, unknown>>(
    baseUrl,
    userJwt,
    'GET',
    `/api/avatar/get-avatar-detail-by-id/${encodeURIComponent(avatarId)}`
  )
}

export async function loadHolonsByMetadata(
  baseUrl: string,
  jwt: string,
  metaKey: string,
  metaValue: string,
  holonType = 'Holon'
): Promise<HolonLike[]> {
  const q = new URLSearchParams({
    metaKey,
    metaValue,
    holonType,
    loadChildren: 'false',
  })
  const list = await oasisFetchJson<unknown[]>(
    baseUrl,
    jwt,
    'GET',
    `/api/data/load-holons-by-metadata?${q.toString()}`
  )
  if (!Array.isArray(list)) return []
  return list.map(normalizeHolon).filter(Boolean) as HolonLike[]
}

export async function saveHolon(
  baseUrl: string,
  jwt: string,
  holon: {
    id: string
    name: string
    description?: string
    holonType: string | number
    parentHolonId?: string
    metadata: Record<string, unknown>
    isActive?: boolean
  }
): Promise<HolonLike> {
  const saved = await oasisFetchJson<HolonLike>(baseUrl, jwt, 'POST', '/api/data/save-holon', {
    holon,
    saveChildren: false,
  })
  return normalizeHolon(saved) || holon
}

/** Partition holons returned by registryAvatarId query */
export function partitionByRecordType(holons: HolonLike[]) {
  const out: Record<string, HolonLike[]> = {
    vintage: [],
    inventory_lot: [],
    allocation: [],
    preorder: [],
    certificate: [],
    visit_log: [],
  }
  for (const h of holons) {
    const t = holonMeta(h).partnerRecordType
    if (typeof t === 'string' && t in out) out[t].push(h)
  }
  return out
}
