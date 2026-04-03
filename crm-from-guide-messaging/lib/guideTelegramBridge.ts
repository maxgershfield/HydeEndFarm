/**
 * Pulmón guide-telegram-bridge — send DM to a Telegram chat from the operator dashboard.
 * Token stays server-side (Next.js API routes).
 */

const BASE = ''

export interface GuideTelegramHealth {
  ok?: boolean
  hasBotToken?: boolean
  botUsername?: string | null
  oasisApi?: string
  localTelegramLinksCount?: number
  error?: string
}

export async function getGuideTelegramHealth(): Promise<GuideTelegramHealth> {
  const res = await fetch(`${BASE}/api/guide-telegram/health`, { cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { ok: false, error: (data as { error?: string }).error ?? res.statusText }
  }
  return data as GuideTelegramHealth
}

export async function getRecentGuideTelegramChatIds(): Promise<string[]> {
  const res = await fetch(`${BASE}/api/guide-telegram/recent-chats`, { cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  const ids = (data as { chatIds?: string[] }).chatIds
  return Array.isArray(ids) ? ids : []
}

export interface LinkedOasisAvatar {
  oasisUsername: string
  telegramChatId: string
}

export async function getLinkedOasisAvatars(): Promise<LinkedOasisAvatar[]> {
  const res = await fetch(`${BASE}/api/guide-telegram/linked-oasis-avatars`, { cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  const avatars = (data as { avatars?: LinkedOasisAvatar[] }).avatars
  return Array.isArray(avatars) ? avatars : []
}

function friendlySendError(status: number, raw: string): string {
  if (status === 401) {
    return 'Permission denied — the messaging app password does not match the bridge. Ask technical staff to align BRIDGE_ADMIN_TOKEN and the app setting.'
  }
  if (status === 503) {
    return 'Not set up on the server — technical staff must add the bridge password to this app’s environment.'
  }
  if (status === 400) {
    return raw || 'Missing chat number or message.'
  }
  if (status === 502) {
    return 'Could not reach the bridge — is the bridge app running on this computer?'
  }
  return raw || `Could not send (${status}).`
}

export async function sendGuideTelegramMessage(
  chatId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${BASE}/api/guide-telegram/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: chatId.trim(), text: text.trim() }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const raw =
      (err as { message?: string }).message ??
      (err as { error?: string }).error ??
      res.statusText
    return { ok: false, error: friendlySendError(res.status, raw) }
  }
  return { ok: true }
}

export async function sendGuideTelegramByOasisUsername(
  oasisUsername: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${BASE}/api/guide-telegram/send-by-oasis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oasisUsername: oasisUsername.trim(), text: text.trim() }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const raw =
      (err as { message?: string }).message ??
      (err as { error?: string }).error ??
      res.statusText
    return { ok: false, error: friendlySendError(res.status, raw) }
  }
  return { ok: true }
}
