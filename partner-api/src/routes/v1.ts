import type { Express, Request, Response } from 'express'
import {
  loadPartnerClients,
  resolveClient,
  effectiveRegistryBackend,
  serviceJwtFor,
  oasisUrl,
  PARTNER_ADMIN_KEY,
} from '../config.js'
import { getAvatarDetailById, getLoggedInAvatar } from '../oasis/client.js'
import { buildPassportView } from '../passportMapper.js'
import { fileRegistry } from '../registry/fileBackend.js'
import { oasisRegistry } from '../registry/oasisBackend.js'
import type { PartnerClientConfig } from '../types.js'

function bearer(req: Request): string | null {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) return null
  return h.slice(7).trim() || null
}

function partnerIdFromReq(req: Request): string | undefined {
  const h = req.headers['x-partner-id']
  if (typeof h === 'string' && h) return h
  if (Array.isArray(h) && h[0]) return h[0]
  return undefined
}

function registryFor(client: PartnerClientConfig) {
  const mode = effectiveRegistryBackend(client, process.env.REGISTRY_BACKEND)
  if (mode === 'file') return { mode: 'file' as const, r: fileRegistry }
  const jwt = serviceJwtFor(client)
  return { mode: 'oasis' as const, r: oasisRegistry(jwt) }
}

function requireUserJwt(req: Request, res: Response): string | null {
  const j = bearer(req)
  if (!j) {
    res.status(401).json({ error: 'Authorization: Bearer <OASIS user JWT> required' })
    return null
  }
  return j
}

function requireAdmin(req: Request, res: Response): boolean {
  if (!PARTNER_ADMIN_KEY) {
    res.status(503).json({ error: 'PARTNER_ADMIN_KEY not configured' })
    return false
  }
  const k = req.headers['x-admin-key']
  const key = typeof k === 'string' ? k : Array.isArray(k) ? k[0] : ''
  if (key !== PARTNER_ADMIN_KEY) {
    res.status(401).json({ error: 'Invalid X-Admin-Key' })
    return false
  }
  return true
}

export function registerV1(app: Express) {
  const clients = loadPartnerClients()

  app.get('/v1/clients', (_req, res) => {
    res.json({
      clients: clients.map((c) => ({
        id: c.id,
        displayName: c.displayName,
        registryTag: c.registryTag,
        backend: effectiveRegistryBackend(c, process.env.REGISTRY_BACKEND),
      })),
    })
  })

  app.get('/v1/syndicate/me', async (req, res) => {
    const userJwt = requireUserJwt(req, res)
    if (!userJwt) return

    let client: PartnerClientConfig
    try {
      client = resolveClient(partnerIdFromReq(req), clients)
    } catch (e) {
      res.status(400).json({ error: (e as Error).message })
      return
    }

    const base = oasisUrl(client)
    try {
      const logged = await getLoggedInAvatar(base, userJwt)
      const avatarId = String(
        logged.id ?? logged.avatarId ?? logged.Id ?? (logged as { AvatarId?: string }).AvatarId ?? ''
      )
      if (!avatarId) {
        res.status(401).json({ error: 'Could not resolve avatar from JWT' })
        return
      }

      const detail = await getAvatarDetailById(base, userJwt, avatarId)
      const { r } = registryFor(client)
      const avatarHolons = await r.loadForAvatar(client, avatarId)
      const vintages = await r.loadVintages(client)
      const passport = buildPassportView(detail, avatarHolons, vintages)

      res.json({
        partnerId: client.id,
        registryTag: client.registryTag,
        backend: registryFor(client).mode,
        passport,
      })
    } catch (e) {
      console.error('[partner-api] /v1/syndicate/me', e)
      res.status(502).json({ error: (e as Error).message })
    }
  })

  const syndicatePost = (
    path: string,
    handler: (
      client: PartnerClientConfig,
      avatarId: string,
      body: Record<string, unknown>,
      res: Response
    ) => Promise<void>
  ) => {
    app.post(path, async (req, res) => {
      const userJwt = requireUserJwt(req, res)
      if (!userJwt) return
      let client: PartnerClientConfig
      try {
        client = resolveClient(partnerIdFromReq(req), clients)
      } catch (e) {
        res.status(400).json({ error: (e as Error).message })
        return
      }
      const base = oasisUrl(client)
      try {
        const logged = await getLoggedInAvatar(base, userJwt)
        const avatarId = String(logged.id ?? logged.avatarId ?? logged.Id ?? '')
        if (!avatarId) {
          res.status(401).json({ error: 'Could not resolve avatar from JWT' })
          return
        }
        await handler(client, avatarId, (req.body || {}) as Record<string, unknown>, res)
      } catch (e) {
        const err = e as Error & { status?: number }
        console.error(`[partner-api] ${path}`, e)
        res.status(err.status ?? 502).json({ error: err.message })
      }
    })
  }

  syndicatePost('/v1/syndicate/preorder', async (client, avatarId, body, res) => {
    const qty = Math.max(1, Number(body.qty) || 0)
    if (!qty) {
      res.status(400).json({ error: 'qty required' })
      return
    }
    const { r } = registryFor(client)
    const holon = await r.createPreorder(client, avatarId, {
      vintageHolonId: typeof body.vintageHolonId === 'string' ? body.vintageHolonId : undefined,
      targetVintageYear:
        body.targetVintageYear != null ? Number(body.targetVintageYear) : undefined,
      qty,
      note: typeof body.note === 'string' ? body.note : undefined,
    })
    res.json({ ok: true, holon })
  })

  syndicatePost('/v1/syndicate/claim', async (client, avatarId, body, res) => {
    const { r } = registryFor(client)
    const holon = await r.claimBottles(client, avatarId, {
      allocationHolonId: typeof body.allocationHolonId === 'string' ? body.allocationHolonId : undefined,
      bottleQty: body.bottleQty != null ? Number(body.bottleQty) : undefined,
    })
    res.json({
      ok: true,
      holon,
      note: 'Mint NFT via OASIS mint-nft in a follow-up step; this updates allocation only.',
    })
  })

  syndicatePost('/v1/syndicate/visit', async (client, avatarId, body, res) => {
    const { r } = registryFor(client)
    const holon = await r.createVisit(client, avatarId, {
      visitType: typeof body.visitType === 'string' ? body.visitType : undefined,
      note: typeof body.note === 'string' ? body.note : undefined,
    })
    res.json({ ok: true, holon })
  })

  app.post('/v1/admin/seed-demo', async (req, res) => {
    if (!requireAdmin(req, res)) return
    let client: PartnerClientConfig
    try {
      client = resolveClient(partnerIdFromReq(req), clients)
    } catch (e) {
      res.status(400).json({ error: (e as Error).message })
      return
    }
    const avatarId = typeof req.body?.avatarId === 'string' ? req.body.avatarId : ''
    if (!avatarId) {
      res.status(400).json({ error: 'avatarId required in JSON body' })
      return
    }
    if (registryFor(client).mode !== 'file') {
      res.status(400).json({ error: 'seed-demo only supported for file backend' })
      return
    }
    const out = await fileRegistry.seedDemo(client, avatarId)
    res.json(out)
  })
}
