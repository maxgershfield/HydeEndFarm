'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  PaperPlaneTilt,
  ChatCircle,
  Megaphone,
  ArrowRight,
  Circle,
} from '@phosphor-icons/react'
import { api } from '@/lib/api'
import { getBridgeStatus, type BridgeStatus } from '@/lib/oasisBridge'
import type { Stats, ConversationSummary } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { BabelfishPanel } from '@/components/BabelfishPanel'
import { GuideTelegramOutPanel } from '@/components/GuideTelegramOutPanel'

const MOSS = '#7ab87a'

function timeAgo(iso: string | null) {
  if (!iso) return '—'
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return '—'
  }
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <div
      style={{
        background: '#111111',
        border: '0.5px solid #1C1C1C',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 12,
            color: '#5C5C5C',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </span>
        <Icon size={16} color={accent ? MOSS : '#2A2A2A'} weight="fill" />
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: accent ? MOSS : '#F0F0F0', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#5C5C5C' }}>{sub}</div>}
    </div>
  )
}

export function LegacyDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [convos, setConvos] = useState<ConversationSummary[]>([])
  const [unionOnline, setUnionOnline] = useState(false)
  const [bridge, setBridge] = useState<BridgeStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBridge() {
      try {
        const b = await getBridgeStatus()
        setBridge(b)
      } catch {
        setBridge({ enabled: false, discordConfigured: false, telegramConfigured: false })
      }
    }
    loadBridge()
    const bt = setInterval(loadBridge, 15_000)
    return () => clearInterval(bt)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [s, c] = await Promise.all([api.stats(), api.conversations()])
        setStats(s)
        setConvos(c.slice(0, 8))
        setUnionOnline(true)
      } catch {
        setUnionOnline(false)
        setStats(null)
        setConvos([])
      } finally {
        setLoading(false)
      }
    }
    load()
    const t = setInterval(load, 10_000)
    return () => clearInterval(t)
  }, [])

  const babelfishOk =
    bridge?.enabled && (bridge.discordConfigured || bridge.telegramConfigured)

  return (
    <div style={{ padding: '40px 40px 64px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
          <Circle size={8} weight="fill" color={babelfishOk ? MOSS : '#444'} />
          <span style={{ fontSize: 11, color: babelfishOk ? MOSS : '#444', letterSpacing: '0.05em' }}>
            {babelfishOk
              ? 'OASIS ChatBridge reachable (Babelfish)'
              : 'ChatBridge offline or disabled — check ONODE + OASIS_API_URL'}
          </span>
          <span style={{ color: '#333' }}>·</span>
          <Circle size={8} weight="fill" color={unionOnline ? '#4ADE80' : '#444'} />
          <span style={{ fontSize: 11, color: unionOnline ? '#4ADE80' : '#444', letterSpacing: '0.05em' }}>
            {unionOnline ? 'Union WhatsApp API' : 'Union API optional (not configured)'}
          </span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F0F0F0', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#5C5C5C' }}>
          Send via <strong style={{ color: MOSS }}>Babelfish</strong> (OASIS ChatBridge) or the{' '}
          <strong style={{ color: MOSS }}>Conservation Passport Telegram bot</strong> (local bridge). Optional Union
          WhatsApp below when <code style={{ color: '#6a9a6a' }}>NEXT_PUBLIC_UNION_API_URL</code> is set.
        </p>
      </div>

      <h2 style={{ fontSize: 13, fontWeight: 600, color: MOSS, marginBottom: 12, letterSpacing: '0.08em' }}>
        BABELFISH — SAME AS OASIS IDE
      </h2>
      <div style={{ marginBottom: 36 }}>
        <BabelfishPanel />
      </div>

      <h2 style={{ fontSize: 13, fontWeight: 600, color: MOSS, marginBottom: 12, letterSpacing: '0.08em' }}>
        PULMÓN TELEGRAM BOT — PASSPORT BRIDGE
      </h2>
      <div style={{ marginBottom: 36 }}>
        <GuideTelegramOutPanel />
      </div>

      <h2 style={{ fontSize: 13, fontWeight: 600, color: '#5C5C5C', marginBottom: 14, letterSpacing: '0.06em' }}>
        UNION WHATSAPP (OPTIONAL)
      </h2>

      {!loading && stats && unionOnline && (
        <div
          className="animate-fade-up"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36 }}
        >
          <StatCard label="Members enrolled" value={stats.memberCount} icon={Users} sub="with WhatsApp" />
          <StatCard label="Messages sent today" value={stats.sentToday} icon={PaperPlaneTilt} accent sub="" />
          <StatCard
            label="Open conversations"
            value={stats.openConversations}
            icon={ChatCircle}
            sub={`${stats.totalUnread} unread`}
          />
          <StatCard label="Broadcasts today" value={stats.broadcastsToday} icon={Megaphone} />
        </div>
      )}

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: 110,
                background: '#111',
                border: '0.5px solid #1C1C1C',
                borderRadius: 12,
              }}
            />
          ))}
        </div>
      )}

      {!unionOnline && !loading && (
        <div
          style={{
            marginBottom: 36,
            padding: '16px 20px',
            background: '#111',
            border: '0.5px solid #1C1C1C',
            borderRadius: 12,
            fontSize: 13,
            color: '#5C5C5C',
          }}
        >
          Union WhatsApp stats hidden — start <code style={{ color: '#444' }}>union-api</code> and set{' '}
          <code style={{ color: '#444' }}>NEXT_PUBLIC_UNION_API_URL</code> to use Compose / Conversations / Automations
          here.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 36 }}>
        <button
          type="button"
          onClick={() => router.push('/compose')}
          style={{
            background: MOSS,
            color: '#030a06',
            border: 'none',
            borderRadius: 10,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <PaperPlaneTilt size={16} weight="fill" />
          WhatsApp compose
        </button>
        <button
          type="button"
          onClick={() => router.push('/conversations')}
          style={{
            background: '#111111',
            color: '#F0F0F0',
            border: '0.5px solid #1C1C1C',
            borderRadius: 10,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <ChatCircle size={16} />
          Conversations
        </button>
      </div>

      {unionOnline && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#F0F0F0' }}>Recent WhatsApp</h2>
            <button
              type="button"
              onClick={() => router.push('/conversations')}
              style={{
                background: 'none',
                border: 'none',
                color: MOSS,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'inherit',
              }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          <div
            style={{
              background: '#111111',
              border: '0.5px solid #1C1C1C',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {convos.length === 0 && !loading && (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: '#5C5C5C', fontSize: 13 }}>
                No conversations yet.
              </div>
            )}
            {convos.map((c, i) => (
              <div
                key={c.phone}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/conversations/${encodeURIComponent(c.phone)}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') router.push(`/conversations/${encodeURIComponent(c.phone)}`)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 20px',
                  borderBottom: i < convos.length - 1 ? '0.5px solid #1C1C1C' : 'none',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(122,184,122,0.1)',
                    border: '0.5px solid rgba(122,184,122,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: MOSS,
                    flexShrink: 0,
                  }}
                >
                  {c.memberName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#F0F0F0' }}>{c.memberName}</span>
                    <span style={{ fontSize: 11, color: '#5C5C5C' }}>{timeAgo(c.lastMessageAt)}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#5C5C5C',
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.lastMessage?.direction === 'outbound' ? '↑ ' : ''}
                    {c.lastMessage?.body ?? '—'}
                  </div>
                </div>
                {c.unreadCount > 0 && (
                  <div
                    style={{
                      background: MOSS,
                      color: '#030a06',
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      flexShrink: 0,
                    }}
                  >
                    {c.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
