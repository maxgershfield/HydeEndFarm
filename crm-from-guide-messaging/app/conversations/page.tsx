'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass, ChatCircle } from '@phosphor-icons/react'
import { api } from '@/lib/api'
import type { ConversationSummary } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

function timeAgo(iso: string | null) {
  if (!iso) return '—'
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true }) }
  catch { return '—' }
}

export default function Conversations() {
  const router = useRouter()
  const [convos, setConvos] = useState<ConversationSummary[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.conversations().then(c => { setConvos(c); setLoading(false) }).catch(() => setLoading(false))
    const t = setInterval(() => api.conversations().then(setConvos).catch(() => {}), 8_000)
    return () => clearInterval(t)
  }, [])

  const filtered = convos.filter(c =>
    c.memberName.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div style={{ padding: '40px', maxWidth: 700 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Conversations</h1>
      <p style={{ fontSize: 14, color: '#5C5C5C', marginBottom: 28 }}>
        All WhatsApp threads with members.
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <MagnifyingGlass size={14} color="#5C5C5C"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search by name or number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px 10px 34px',
            background: '#111111', border: '0.5px solid #1C1C1C',
            borderRadius: 8, color: '#F0F0F0', fontSize: 13,
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* List */}
      <div style={{ background: '#111111', border: '0.5px solid #1C1C1C', borderRadius: 12, overflow: 'hidden' }}>
        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: '#5C5C5C', fontSize: 13 }}>
            Loading...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <ChatCircle size={32} color="#2A2A2A" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: '#5C5C5C' }}>
              {search ? 'No conversations match your search' : 'No conversations yet'}
            </div>
          </div>
        )}
        {filtered.map((c, i) => (
          <div
            key={c.phone}
            onClick={() => router.push(`/conversations/${encodeURIComponent(c.phone)}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '0.5px solid #1C1C1C' : 'none',
              cursor: 'pointer', transition: 'background 0.12s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#161616')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Avatar */}
            <div
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(122,184,122,0.1)',
                border: '0.5px solid rgba(122,184,122,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: '#7ab87a',
                flexShrink: 0,
              }}
            >
              {c.memberName.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#F0F0F0' }}>{c.memberName}</span>
                <span style={{ fontSize: 11, color: '#5C5C5C', flexShrink: 0, marginLeft: 8 }}>{timeAgo(c.lastMessageAt)}</span>
              </div>
              <div style={{
                fontSize: 12, color: c.unreadCount > 0 ? '#A0A0A0' : '#5C5C5C',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontWeight: c.unreadCount > 0 ? 500 : 400,
              }}>
                {c.lastMessage?.direction === 'outbound' ? '↑ ' : '↓ '}
                {c.lastMessage?.body ?? '—'}
              </div>
              <div style={{ fontSize: 10, color: '#3A3A3A', marginTop: 2 }}>{c.phone}</div>
            </div>

            {c.unreadCount > 0 && (
              <div style={{
                background: '#7ab87a', color: '#090909',
                borderRadius: 10, fontSize: 10, fontWeight: 700,
                padding: '2px 7px', flexShrink: 0,
              }}>
                {c.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
