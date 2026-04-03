'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Circle } from '@phosphor-icons/react'
import { PaperPlaneTilt, ChatCircle, ArrowRight } from '@phosphor-icons/react'
import { GuideTelegramOutPanel } from '@/components/GuideTelegramOutPanel'
import { getGuideTelegramHealth, type GuideTelegramHealth } from '@/lib/guideTelegramBridge'

const MOSS = '#7ab87a'
const GOLD = '#c9a84c'

export default function Home() {
  const router = useRouter()
  const [health, setHealth] = useState<GuideTelegramHealth | null>(null)

  useEffect(() => {
    getGuideTelegramHealth().then(setHealth).catch(() => setHealth({ ok: false }))
    const t = setInterval(() => getGuideTelegramHealth().then(setHealth).catch(() => {}), 20_000)
    return () => clearInterval(t)
  }, [])

  const bridgeOk = health?.ok === true && health?.hasBotToken === true

  return (
    <div style={{ padding: '40px 40px 64px', maxWidth: 1100 }}>
      {/* Union-style header — Pulmón status strip */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <Circle size={8} weight="fill" color={bridgeOk ? MOSS : '#4a5a4a'} />
          <span style={{ fontSize: 11, color: bridgeOk ? MOSS : '#6a7a6a', letterSpacing: '0.05em' }}>
            {bridgeOk
              ? `Telegram bot ready${health?.botUsername ? ` · @${health.botUsername}` : ''}`
              : 'Bridge offline — start guide-telegram-bridge'}
          </span>
        </div>
        <h1
          className="pv-display"
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#e8f0e4',
            marginBottom: 6,
            letterSpacing: '0.02em',
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--pv-dim)', maxWidth: 520, lineHeight: 1.5 }}>
          Pulmón Verde — send Telegram messages to visitors who use the Conservation Passport and The Guide bot.
        </p>
      </div>

      {/* Union-style quick actions — moss primary, dark secondary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
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
            transition: 'opacity 0.15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.92')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <PaperPlaneTilt size={16} weight="fill" />
          Send a message
        </button>
        <button
          type="button"
          onClick={() => router.push('/conversations')}
          style={{
            background: '#0c1812',
            color: '#e8f0e4',
            border: '0.5px solid rgba(122, 184, 122, 0.2)',
            borderRadius: 10,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#122018')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#0c1812')}
        >
          <ChatCircle size={16} />
          View conversations
        </button>
      </div>

      <h2
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: MOSS,
          marginBottom: 12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Telegram — quick send
      </h2>
      <div style={{ marginBottom: 36 }}>
        <GuideTelegramOutPanel />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#e8f0e4' }}>Tips</h2>
        <button
          type="button"
          onClick={() => router.push('/advanced')}
          style={{
            background: 'none',
            border: 'none',
            color: GOLD,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'inherit',
          }}
        >
          OASIS Babelfish & WhatsApp <ArrowRight size={12} />
        </button>
      </div>
      <div
        style={{
          background: '#0c1812',
          border: '0.5px solid rgba(122, 184, 122, 0.15)',
          borderRadius: 12,
          padding: '18px 20px',
          fontSize: 13,
          color: '#8a9a8e',
          lineHeight: 1.55,
        }}
      >
        Same <strong style={{ color: MOSS }}>sidebar layout</strong> as The Union messaging app: Dashboard, Compose,
        Conversations, Automations. This build uses a <strong style={{ color: '#e8f0e4' }}>jungle</strong> palette
        (moss, deep green, gold accents) for Pulmón Verde. Use <strong style={{ color: GOLD }}>Advanced</strong> for
        legacy Babelfish / optional Union WhatsApp tools.
      </div>
    </div>
  )
}
