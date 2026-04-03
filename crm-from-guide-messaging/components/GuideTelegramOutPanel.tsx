'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getGuideTelegramHealth,
  getLinkedOasisAvatars,
  getRecentGuideTelegramChatIds,
  sendGuideTelegramByOasisUsername,
  sendGuideTelegramMessage,
  type GuideTelegramHealth,
  type LinkedOasisAvatar,
} from '@/lib/guideTelegramBridge'

const MOSS = '#7ab87a'

type RecipientMode = 'oasis' | 'telegram'

export function GuideTelegramOutPanel() {
  const [health, setHealth] = useState<GuideTelegramHealth | null>(null)
  const [mode, setMode] = useState<RecipientMode>('oasis')
  const [oasisUsername, setOasisUsername] = useState('')
  const [chatId, setChatId] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [recentChats, setRecentChats] = useState<string[]>([])
  const [linkedAvatars, setLinkedAvatars] = useState<LinkedOasisAvatar[]>([])

  const loadHealth = useCallback(async () => {
    try {
      const h = await getGuideTelegramHealth()
      setHealth(h)
    } catch {
      setHealth({ ok: false, error: 'unreachable' })
    }
  }, [])

  const loadRecentChats = useCallback(async () => {
    try {
      const ids = await getRecentGuideTelegramChatIds()
      setRecentChats(ids)
    } catch {
      setRecentChats([])
    }
  }, [])

  const loadLinkedAvatars = useCallback(async () => {
    try {
      const rows = await getLinkedOasisAvatars()
      setLinkedAvatars(rows)
    } catch {
      setLinkedAvatars([])
    }
  }, [])

  useEffect(() => {
    loadHealth()
    loadRecentChats()
    loadLinkedAvatars()
    const t = setInterval(loadHealth, 25_000)
    const t2 = setInterval(loadRecentChats, 18_000)
    const t3 = setInterval(loadLinkedAvatars, 18_000)
    return () => {
      clearInterval(t)
      clearInterval(t2)
      clearInterval(t3)
    }
  }, [loadHealth, loadRecentChats, loadLinkedAvatars])

  async function handleSend() {
    const msg = text.trim()
    if (!msg || sending) return
    if (mode === 'oasis') {
      const u = oasisUsername.trim()
      if (!u) return
    } else {
      if (!chatId.trim()) return
    }

    setError('')
    setSuccess(false)
    setSending(true)
    try {
      const res =
        mode === 'oasis'
          ? await sendGuideTelegramByOasisUsername(oasisUsername.trim(), msg)
          : await sendGuideTelegramMessage(chatId.trim(), msg)
      if (!res.ok) {
        setError(res.error ?? 'Could not send. Try again or ask technical staff.')
        return
      }
      setSuccess(true)
      setText('')
      setTimeout(() => setSuccess(false), 4000)
      loadHealth()
      loadRecentChats()
      loadLinkedAvatars()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSending(false)
    }
  }

  const bridgeOk = health?.ok === true && health?.hasBotToken === true
  const botName = health?.botUsername ? `@${health.botUsername}` : null

  return (
    <div
      style={{
        background: '#0c1812',
        border: '0.5px solid rgba(122, 184, 122, 0.2)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(122, 184, 122, 0.06)',
      }}
    >
      {/* Status — plain language */}
      <div
        style={{
          padding: '16px 18px',
          background: bridgeOk ? 'rgba(122,184,122,0.07)' : 'rgba(180,80,80,0.08)',
          borderBottom: '0.5px solid rgba(122, 184, 122, 0.12)',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: bridgeOk ? MOSS : '#f0a0a0', marginBottom: 4 }}>
          {bridgeOk ? 'Ready to send' : 'Not connected to the bot'}
        </div>
        <div style={{ fontSize: 13, color: '#8a9a8e', lineHeight: 1.45 }}>
          {bridgeOk
            ? botName
              ? `The ${botName} bot is running. You can send below.`
              : 'The bot is running. You can send below.'
            : 'This computer cannot reach the Telegram bridge. Ask technical staff to start the bridge app and check settings — then refresh this page.'}
        </div>
      </div>

      <div style={{ padding: '18px 18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['oasis', 'telegram'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                flex: '1 1 140px',
                padding: '10px 14px',
                borderRadius: 10,
                border: mode === m ? `2px solid ${MOSS}` : '1px solid rgba(122,184,122,0.2)',
                background: mode === m ? 'rgba(122,184,122,0.12)' : '#06120c',
                color: '#E8E8E8',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {m === 'oasis' ? 'OASIS username' : 'Telegram chat ID'}
            </button>
          ))}
        </div>

        {mode === 'oasis' && (
          <>
            {linkedAvatars.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#7a9a82', marginBottom: 8 }}>
                  Linked on this bridge — tap a name
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {linkedAvatars.map((row) => (
                    <button
                      key={`${row.oasisUsername}-${row.telegramChatId}`}
                      type="button"
                      onClick={() => setOasisUsername(row.oasisUsername)}
                      style={{
                        fontSize: 14,
                        padding: '8px 14px',
                        borderRadius: 8,
                        border:
                          oasisUsername.trim().toLowerCase() === row.oasisUsername.trim().toLowerCase()
                            ? `2px solid ${MOSS}`
                            : '1px solid rgba(122,184,122,0.15)',
                        background:
                          oasisUsername.trim().toLowerCase() === row.oasisUsername.trim().toLowerCase()
                            ? 'rgba(122,184,122,0.12)'
                            : '#06120c',
                        color: '#E8E8E8',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {row.oasisUsername}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#7a9a82' }}>OASIS avatar username</span>
              <input
                type="text"
                placeholder="Same name they use in OASIS"
                value={oasisUsername}
                onChange={(e) => setOasisUsername(e.target.value)}
                style={{
                  background: '#06120c',
                  border: '1px solid rgba(122,184,122,0.2)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 16,
                  color: '#E8E8E8',
                  outline: 'none',
                }}
              />
            </label>
            <p style={{ fontSize: 12, color: '#5a7a62', margin: 0, lineHeight: 1.45 }}>
              Delivers to Telegram if they used <strong>Connect Telegram</strong> on the passport on this bridge. If
              not linked yet, switch to Telegram chat ID or ask them to connect first.
            </p>
          </>
        )}

        {mode === 'telegram' && (
          <>
            {recentChats.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#7a9a82', marginBottom: 8 }}>
                  People who messaged the bot recently — tap to select
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {recentChats.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setChatId(id)}
                      style={{
                        fontSize: 14,
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: chatId === id ? `2px solid ${MOSS}` : '1px solid rgba(122,184,122,0.15)',
                        background: chatId === id ? 'rgba(122,184,122,0.12)' : '#06120c',
                        color: '#E8E8E8',
                        cursor: 'pointer',
                        fontFamily: 'ui-monospace, monospace',
                      }}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#7a9a82' }}>Or type their chat number</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Numbers only"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                style={{
                  background: '#06120c',
                  border: '1px solid rgba(122,184,122,0.2)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 16,
                  color: '#E8E8E8',
                  outline: 'none',
                }}
              />
            </label>
          </>
        )}

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7a9a82' }}>Your message</span>
          <textarea
            placeholder="Write what you want them to receive in Telegram…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            style={{
              background: '#06120c',
              border: '1px solid rgba(122,184,122,0.2)',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 15,
              color: '#E8E8E8',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: 1.45,
            }}
          />
        </label>

        {error && (
          <div
            style={{
              fontSize: 13,
              color: '#fca5a5',
              padding: '10px 12px',
              background: 'rgba(248,113,113,0.08)',
              borderRadius: 8,
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div style={{ fontSize: 14, color: MOSS, fontWeight: 600 }}>Sent. They should see it in Telegram.</div>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={
            sending ||
            !text.trim() ||
            !bridgeOk ||
            (mode === 'oasis' ? !oasisUsername.trim() : !chatId.trim())
          }
          style={{
            alignSelf: 'stretch',
            background:
              sending ||
              !text.trim() ||
              !bridgeOk ||
              (mode === 'oasis' ? !oasisUsername.trim() : !chatId.trim())
                ? '#2a3a32'
                : MOSS,
            color: '#030a06',
            border: 'none',
            borderRadius: 10,
            padding: '14px 20px',
            fontSize: 16,
            fontWeight: 700,
            cursor:
              sending ||
              !text.trim() ||
              !bridgeOk ||
              (mode === 'oasis' ? !oasisUsername.trim() : !chatId.trim())
                ? 'not-allowed'
                : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {sending ? 'Sending…' : 'Send message'}
        </button>

        <details style={{ fontSize: 11, color: '#4a6a52', lineHeight: 1.5 }}>
          <summary style={{ cursor: 'pointer', color: '#6a8a72' }}>Technical details</summary>
          <p style={{ marginTop: 8 }}>
            Staff app talks to the <strong>guide-telegram-bridge</strong> on this machine. If sends fail, the bridge
            password in this app must match <code style={{ color: '#888' }}>BRIDGE_ADMIN_TOKEN</code> in the bridge
            config. Bridge URL defaults to <code style={{ color: '#888' }}>http://127.0.0.1:3847</code> unless changed
            in environment.
          </p>
        </details>
      </div>
    </div>
  )
}
