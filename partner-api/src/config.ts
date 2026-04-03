import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PartnerClientConfig } from './types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface LoadedClientsFile {
  clients: PartnerClientConfig[]
}

function stripTrailingSlash(u: string): string {
  return u.replace(/\/$/, '')
}

function serviceJwtFor(client: PartnerClientConfig): string {
  if (client.serviceJwt) return client.serviceJwt
  if (client.serviceJwtEnv && process.env[client.serviceJwtEnv])
    return process.env[client.serviceJwtEnv] as string
  return process.env.OASIS_SERVICE_JWT ?? ''
}

function defaultClientFromEnv(): PartnerClientConfig {
  return {
    id: process.env.PARTNER_ID || 'default',
    displayName: process.env.PARTNER_DISPLAY_NAME || 'Default partner',
    oasisApiUrl: stripTrailingSlash(process.env.OASIS_API_URL || 'https://api.oasisweb4.com'),
    registryTag: process.env.PARTNER_REGISTRY_TAG || 'default_partner_v1',
  }
}

function loadClientsFromPath(p: string): PartnerClientConfig[] {
  const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p)
  const raw = fs.readFileSync(abs, 'utf8')
  const j = JSON.parse(raw) as LoadedClientsFile
  if (!j.clients?.length) throw new Error('clients.json: missing clients[]')
  return j.clients.map((c) => ({
    ...c,
    oasisApiUrl: stripTrailingSlash(c.oasisApiUrl || 'https://api.oasisweb4.com'),
  }))
}

export function loadPartnerClients(): PartnerClientConfig[] {
  const fromPath = process.env.PARTNER_CLIENTS_PATH
  if (fromPath) return loadClientsFromPath(fromPath)
  return [defaultClientFromEnv()]
}

export function resolveClient(partnerId: string | undefined, clients: PartnerClientConfig[]): PartnerClientConfig {
  const id = partnerId || clients[0]?.id
  const c = clients.find((x) => x.id === id)
  if (!c) {
    const known = clients.map((x) => x.id).join(', ')
    throw new Error(`Unknown X-Partner-Id (known: ${known || 'none'})`)
  }
  return c
}

export function effectiveRegistryBackend(
  client: PartnerClientConfig,
  globalBackend: string | undefined
): 'oasis' | 'file' {
  const per = client.registryBackend
  if (per === 'file' || per === 'oasis') return per
  const g = (globalBackend || process.env.REGISTRY_BACKEND || 'oasis').toLowerCase()
  if (g === 'file') return 'file'
  return 'oasis'
}

export function oasisUrl(client: PartnerClientConfig): string {
  return stripTrailingSlash(client.oasisApiUrl)
}

export { serviceJwtFor }

export const PORT = Number(process.env.PORT || 8788)
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
export const PARTNER_ADMIN_KEY = process.env.PARTNER_ADMIN_KEY || ''
