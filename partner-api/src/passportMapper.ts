import { partitionByRecordType } from './oasis/client.js'
import { holonMeta, type HolonLike } from './types.js'

/** Keep tier ids aligned with `passport.html` TIERS (Hyde End HUD). */
const TIERS = [
  { id: 'seed', min: 0 },
  { id: 'root', min: 250 },
  { id: 'flower', min: 600 },
  { id: 'storm', min: 1200 },
  { id: 'guardian', min: 2500 },
  { id: 'custodian', min: 5000 },
]

function tierFromKarma(k: number): string {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (k >= TIERS[i].min) return TIERS[i].id
  }
  return 'seed'
}

function metaFromDetail(detail: Record<string, unknown>): Record<string, unknown> {
  const raw = detail.metadata ?? detail.MetaData ?? detail.metaData
  return raw && typeof raw === 'object' ? { ...(raw as object) } : {}
}

/**
 * Build passport HUD shape compatible with Hyde End `passport.html` `mapOasisDetail` + extras.
 */
export function buildPassportView(
  detail: Record<string, unknown>,
  avatarHolons: HolonLike[],
  vintages: HolonLike[]
) {
  const id = String(detail.id ?? detail.avatarId ?? detail.Id ?? '')
  const first = String(detail.firstName ?? detail.FirstName ?? '')
  const last = String(detail.lastName ?? detail.LastName ?? '')
  const name = `${first} ${last}`.trim() || String(detail.username ?? detail.Username ?? 'Member')
  const karma = Number(detail.karma ?? detail.Karma ?? 0) || 0
  const baseMeta = metaFromDetail(detail)

  const part = partitionByRecordType(avatarHolons)
  const allocations = part.allocation
  const preorders = part.preorder
  const certificates = part.certificate

  const bottlesAllocated = allocations.reduce(
    (s, h) => s + (Number(holonMeta(h).bottlesAllocated) || 0),
    0
  )
  const bottlesClaimed = allocations.reduce(
    (s, h) => s + (Number(holonMeta(h).bottlesClaimed) || 0),
    0
  )
  const giftable = allocations.reduce(
    (s, h) => s + (Number(holonMeta(h).bottlesGiftable) || 0),
    0
  )

  let tier = String(
    baseMeta.wineSyndicateTier ?? baseMeta.syndicateTier ?? ''
  ).toLowerCase()
  if (!TIERS.some((t) => t.id === tier)) tier = tierFromKarma(karma)

  const preorderCount = preorders.length
  const certsHeld = certificates.length || Number(baseMeta.certificatesHeld) || 0

  const vintageFromAlloc = allocations
    .map((h) => holonMeta(h).vintageHolonId)
    .find(Boolean) as string | undefined
  const vintageHolon = vintageFromAlloc
    ? vintages.find((v) => v.id === vintageFromAlloc)
    : vintages[0]
  const vintageLabel =
    (vintageHolon && String(holonMeta(vintageHolon).vintageYear ?? '')) ||
    String(baseMeta.vintageYear ?? baseMeta.wineVintage ?? '') ||
    null

  const activity: { ts: string; msg: string; pts: string }[] = []
  for (const p of [...preorders].reverse().slice(0, 5)) {
    const m = holonMeta(p)
    activity.push({
      ts: String(m.createdAt ?? '').slice(5, 16) || '—',
      msg: `Pre-order · ${m.qty} bottles${m.targetVintageYear ? ` → ${m.targetVintageYear}` : ''}`,
      pts: '+pre',
    })
  }
  if (activity.length === 0) {
    activity.push({ ts: 'now', msg: 'Partner registry synced', pts: '' })
  }

  return {
    name,
    avatarId: id,
    forestId: String(baseMeta.syndicateId ?? baseMeta.parcelId ?? `SYN-${id.slice(0, 8).toUpperCase()}`),
    memberSince: String(detail.createdDate ?? baseMeta.memberSince ?? '—').slice(0, 10),
    lastCheckin: String(baseMeta.lastActivity ?? activity[0]?.msg ?? '—').slice(0, 48),
    tier,
    karma,
    treesRegistered: bottlesAllocated || Number(baseMeta.bottlesReserved) || 0,
    speciesDocumented: certsHeld,
    co2Annual: Number(baseMeta.co2Annual ?? baseMeta.co2_t_per_year ?? 0) || 0,
    vintageLabel,
    giftableCount: giftable || Number(baseMeta.giftableCertificates) || null,
    pgtHours: Number(baseMeta.pgtHours ?? baseMeta.pgt_hours) || null,
    questsDone: preorderCount || Number(baseMeta.preorderCount ?? baseMeta.questsDone) || 0,
    stamps: ['budbreak'],
    activity,
    source: 'partner_api',
    partner: {
      allocations: allocations.map((h) => ({ id: h.id, ...holonMeta(h) })),
      preorders: preorders.map((h) => ({ id: h.id, ...holonMeta(h) })),
      certificates: certificates.map((h) => ({ id: h.id, ...holonMeta(h) })),
      visits: part.visit_log.map((h) => ({ id: h.id, ...holonMeta(h) })),
      vintages: vintages.map((h) => ({ id: h.id, ...holonMeta(h) })),
      inventoryLots: part.inventory_lot.map((h) => ({ id: h.id, ...holonMeta(h) })),
      summary: {
        bottlesAllocated,
        bottlesClaimed,
        bottlesUnclaimed: Math.max(0, bottlesAllocated - bottlesClaimed),
        preorderCount,
        certificatesHeld: certsHeld,
        giftableBottles: giftable,
      },
    },
  }
}
