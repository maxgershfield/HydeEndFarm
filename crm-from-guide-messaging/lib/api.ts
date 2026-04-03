import type {
  Stats, Member, Conversation, ConversationSummary,
  Automation, BroadcastEntry, Message
} from './types'

/** Union WhatsApp API (optional — same contract as The Union union-messaging). */
const BASE = process.env.NEXT_PUBLIC_UNION_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  stats: ()                            => get<Stats>('/api/messaging/stats'),
  members: ()                          => get<Member[]>('/api/messaging/members'),
  conversations: ()                    => get<ConversationSummary[]>('/api/messaging/conversations'),
  conversation: (phone: string)        => get<Conversation>(`/api/messaging/conversations/${encodeURIComponent(phone)}`),
  markRead: (phone: string)            => post<{ ok: boolean }>(`/api/messaging/conversations/${encodeURIComponent(phone)}/read`, {}),
  send: (phone: string, memberName: string, message: string) =>
    post<{ ok: boolean; phone: string }>('/api/messaging/send', { phone, memberName, message }),
  broadcast: (message: string, filter = 'all') =>
    post<{ ok: boolean; sent: number; errors: unknown[]; broadcastId: string }>('/api/messaging/broadcast', { message, filter }),
  automations: ()                      => get<Automation[]>('/api/messaging/automations'),
  updateAutomation: (id: string, patch: Partial<Automation>) =>
    put<Automation>(`/api/messaging/automations/${id}`, patch),
  broadcasts: ()                       => get<BroadcastEntry[]>('/api/messaging/broadcasts'),
}
