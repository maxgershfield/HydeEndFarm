'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getBridgeMessages,
  getBridgeStatus,
  sendBridgeMessage,
  type BridgeMessage,
  type BridgeStatus,
} from '@/lib/oasisBridge'

const MOSS = '#7ab87a'

const PLATFORM_ICON: Record<string, string> = {
  discord: '🎮',
  telegram: '📱',
  ide: '💻',
  ai: '🤖',
}

const PLATFORM_LABEL: Record<string, string> = {
  discord: 'Discord',
  telegram: 'Telegram',
  ide: 'IDE / Dashboard',
  ai: 'AI',
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function BabelfishPanel() {
  const [messages, setMessages] = useState<BridgeMessage[]>([])
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [senderName, setSenderName] = useState('Pulmón Guide')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const latestIdRef = useRef('')

  const fetchMessages = useCallback(async () => {
    try {
      const msgs = await getBridgeMessages(100)
      if (!Array.isArray(msgs)) return
      setMessages((prev) => {
        if (msgs.length === 0) return prev
        const lastNew = msgs[msgs.length - 1]?.id ?? ''
        if (lastNew && lastNew === latestIdRef.current) return prev
        latestIdRef.current = lastNew
        return msgs
      })
    } catch {
      /* ignore */
    }
  }, [])

  const fetchStatus = useCallback(async () => {
    try {
      const s = await getBridgeStatus()
      setStatus(s)
    } catch {
      setStatus({ enabled: false, discordConfigured: false, telegramConfigured: false })
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    fetchMessages()
    pollRef.current = setInterval(fetchMessages, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchStatus, fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setError('')
    setSending(true)
    try {
      const res = await sendBridgeMessage(senderName.trim() || 'Pulmón Guide', text)
      if (!res.ok) {
        setError(res.error ?? 'Failed to send')
        return
      }
      const local: BridgeMessage = {
        id: `local-${Date.now()}`,
        timestampUtc: new Date().toISOString(),
        platform: 'ide',
        senderName: senderName.trim() || 'Pulmón Guide',
        text,
      }
      setMessages((prev) => [...prev, local])
      setTimeout(fetchMessages, 500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send error')
    } finally {
      setSending(false)
    }
  }

  const discordOk = status?.discordConfigured ?? false
  const telegramOk = status?.telegramConfigured ?? false
  const bridgeOn = status?.enabled ?? false

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#111111',
        border: '0.5px solid #1C1C1C',
        borderRadius: 12,
        overflow: 'hidden',
        minHeight: 440,
        maxHeight: 'min(62vh, 640px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '0.5px solid #1C1C1C',
          background: '#0D0D0D',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: MOSS }}>🌉 Babelfish</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              color: '#5C5C5C',
              padding: '2px 8px',
              borderRadius: 6,
              border: '0.5px solid #262626',
            }}
            title="Shown as sender on Discord / Telegram"
          >
            From
          </span>
          <input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            style={{
              width: 140,
              padding: '4px 8px',
              fontSize: 12,
              background: '#171717',
              border: '0.5px solid #262626',
              borderRadius: 6,
              color: '#F0F0F0',
              fontFamily: 'inherit',
            }}
          />
          <span
            title="Discord"
            style={{
              opacity: bridgeOn && discordOk ? 1 : 0.35,
              fontSize: 16,
            }}
          >
            🎮
          </span>
          <span
            title="Telegram"
            style={{
              opacity: bridgeOn && telegramOk ? 1 : 0.35,
              fontSize: 16,
            }}
          >
            📱
          </span>
        </div>
      </div>

      <p style={{ fontSize: 11, color: '#5C5C5C', padding: '8px 16px 0', margin: 0, lineHeight: 1.5 }}>
        Same OASIS ChatBridge as the OASIS IDE: your line goes to the configured Discord + Telegram bridge channels.
        Set <code style={{ color: MOSS }}>OASIS_API_URL</code> on this Next server if ONODE is not public default.
      </p>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 ? (
          <div style={{ color: '#444', fontSize: 13, textAlign: 'center', padding: '24px 8px' }}>
            No messages yet — send below or wait for Discord / Telegram.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '8px 0',
                borderBottom: '0.5px solid #1A1A1A',
              }}
            >
              <span style={{ fontSize: 14 }}>{PLATFORM_ICON[m.platform] ?? '💬'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, fontSize: 12, color: '#E8E8E8' }}>{m.senderName}</span>
                  <span style={{ fontSize: 10, color: '#5C5C5C' }}>
                    {PLATFORM_LABEL[m.platform] ?? m.platform}
                  </span>
                  <span style={{ fontSize: 10, color: '#444' }}>{formatTime(m.timestampUtc)}</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#C8C8C8', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {m.text}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div style={{ padding: '0 16px 8px', fontSize: 12, color: '#EF4444' }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '0.5px solid #1C1C1C', background: '#0D0D0D' }}>
        <textarea
          placeholder="Message tourists’ channels (Discord + Telegram)…"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          rows={2}
          disabled={sending}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: '#171717',
            border: `0.5px solid ${error ? '#EF4444' : '#262626'}`,
            borderRadius: 8,
            color: '#F0F0F0',
            fontSize: 13,
            fontFamily: 'inherit',
            resize: 'none',
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !input.trim()}
          style={{
            alignSelf: 'flex-end',
            width: 44,
            height: 44,
            borderRadius: 8,
            border: 'none',
            cursor: input.trim() ? 'pointer' : 'default',
            background: input.trim() ? MOSS : '#1C1C1C',
            color: input.trim() ? '#030a06' : '#444',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
