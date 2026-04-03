/**
 * Babelfish / OASIS ChatBridge — same endpoints as IDE-repo-push OASISAPIClient.
 * Browser calls Next.js `/api/chatbridge/*` (proxy) to avoid CORS on ONODE.
 */

const BASE = ''

export interface BridgeMessage {
  id: string
  timestampUtc: string
  platform: string
  senderName: string
  text: string
}

export interface BridgeStatus {
  enabled: boolean
  discordConfigured: boolean
  telegramConfigured: boolean
}

function normalizeMessage(raw: Record<string, unknown>): BridgeMessage {
  return {
    id: String(raw.id ?? raw.Id ?? ''),
    timestampUtc: String(raw.timestampUtc ?? raw.TimestampUtc ?? new Date().toISOString()),
    platform: String(raw.platform ?? raw.Platform ?? 'unknown'),
    senderName: String(raw.senderName ?? raw.SenderName ?? ''),
    text: String(raw.text ?? raw.Text ?? ''),
  }
}

export async function getBridgeStatus(): Promise<BridgeStatus> {
  const res = await fetch(`${BASE}/api/chatbridge/status`, { cache: 'no-store' })
  if (!res.ok) return { enabled: false, discordConfigured: false, telegramConfigured: false }
  const d = await res.json().catch(() => ({}))
  return {
    enabled: Boolean(d.enabled),
    discordConfigured: Boolean(d.discordConfigured),
    telegramConfigured: Boolean(d.telegramConfigured),
  }
}

export async function getBridgeMessages(limit = 100): Promise<BridgeMessage[]> {
  const res = await fetch(`${BASE}/api/chatbridge/messages?limit=${limit}`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json().catch(() => [])
  if (!Array.isArray(data)) return []
  return data.map((x) => normalizeMessage(x as Record<string, unknown>))
}

export async function sendBridgeMessage(senderName: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${BASE}/api/chatbridge/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderName, text }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { ok: false, error: (err as { message?: string }).message ?? res.statusText }
  }
  return { ok: true }
}
