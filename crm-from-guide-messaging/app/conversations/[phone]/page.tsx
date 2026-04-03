'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, PaperPlaneTilt, CheckCircle, Warning } from '@phosphor-icons/react'
import { api } from '@/lib/api'
import type { Conversation, Message } from '@/lib/types'
import { format } from 'date-fns'

function formatTime(iso: string) {
  try { return format(new Date(iso), 'HH:mm') }
  catch { return '' }
}

function formatDate(iso: string) {
  try { return format(new Date(iso), 'EEEE d MMM') }
  catch { return '' }
}

function groupByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = []
  let lastDate = ''
  for (const msg of messages) {
    const d = msg.timestamp?.slice(0, 10) ?? ''
    if (d !== lastDate) {
      groups.push({ date: d, messages: [msg] })
      lastDate = d
    } else {
      groups[groups.length - 1].messages.push(msg)
    }
  }
  return groups
}

export default function ConversationThread() {
  const { phone } = useParams<{ phone: string }>()
  const decoded = decodeURIComponent(phone)
  const router = useRouter()

  const [conv, setConv] = useState<Conversation | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const bottomRef = useRef<HTMLDivElement>(null)

  async function load() {
    try {
      const c = await api.conversation(decoded)
      setConv(c)
      await api.markRead(decoded).catch(() => {})
    } catch {}
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 5_000)
    return () => clearInterval(t)
  }, [decoded])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conv?.messages?.length])

  async function handleSend() {
    if (!reply.trim() || sending) return
    setSending(true)
    try {
      await api.send(decoded, conv?.memberName ?? decoded, reply)
      setReply('')
      setSendStatus('success')
      await load()
    } catch {
      setSendStatus('error')
    }
    setSending(false)
    setTimeout(() => setSendStatus('idle'), 2500)
  }

  const groups = groupByDate(conv?.messages ?? [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          background: '#0D0D0D',
          borderBottom: '0.5px solid #1C1C1C',
          display: 'flex', alignItems: 'center', gap: 14,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => router.push('/conversations')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5C5C5C', display: 'flex', padding: 0 }}
        >
          <ArrowLeft size={18} />
        </button>
        <div
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(122,184,122,0.1)',
            border: '0.5px solid rgba(122,184,122,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: '#7ab87a',
          }}
        >
          {(conv?.memberName ?? '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#F0F0F0' }}>
            {conv?.memberName ?? decoded}
          </div>
          <div style={{ fontSize: 11, color: '#5C5C5C' }}>{decoded}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {conv?.messages?.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#333', fontSize: 13 }}>
              No messages yet. Send one below.
            </div>
          </div>
        )}

        {groups.map(({ date, messages }) => (
          <div key={date}>
            {/* Date divider */}
            <div style={{ textAlign: 'center', margin: '20px 0 16px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '0.5px', background: '#1C1C1C' }} />
              <span style={{
                position: 'relative', background: '#090909',
                padding: '0 12px', fontSize: 11, color: '#5C5C5C',
              }}>
                {formatDate(messages[0].timestamp)}
              </span>
            </div>

            {/* Messages in date group */}
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.direction === 'outbound' ? 'flex-end' : 'flex-start',
                  marginBottom: 8,
                }}
              >
                <div style={{ maxWidth: '70%' }}>
                  <div
                    className={msg.direction === 'outbound' ? 'bubble-out' : 'bubble-in'}
                    style={{ padding: '10px 14px', fontSize: 13, lineHeight: 1.6, color: '#E8E8E8', whiteSpace: 'pre-wrap' }}
                  >
                    {msg.body}
                  </div>
                  <div style={{
                    fontSize: 10, color: '#3A3A3A', marginTop: 4,
                    textAlign: msg.direction === 'outbound' ? 'right' : 'left',
                    paddingRight: msg.direction === 'outbound' ? 6 : 0,
                    paddingLeft: msg.direction === 'inbound' ? 6 : 0,
                  }}>
                    {formatTime(msg.timestamp)}
                    {msg.direction === 'outbound' && ` · ${msg.status}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      <div
        style={{
          padding: '16px 24px',
          background: '#0D0D0D',
          borderTop: '0.5px solid #1C1C1C',
          flexShrink: 0,
        }}
      >
        {sendStatus === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ADE80', fontSize: 12, marginBottom: 8 }}>
            <CheckCircle size={13} weight="fill" /> Sent
          </div>
        )}
        {sendStatus === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#EF4444', fontSize: 12, marginBottom: 8 }}>
            <Warning size={13} weight="fill" /> Failed to send
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            placeholder="Type a message..."
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            rows={1}
            style={{
              flex: 1, padding: '10px 14px',
              background: '#171717', border: '0.5px solid #262626',
              borderRadius: 10, color: '#F0F0F0', fontSize: 13,
              fontFamily: 'inherit', resize: 'none', lineHeight: 1.5,
              minHeight: 42,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!reply.trim() || sending}
            style={{
              width: 42, height: 42, borderRadius: 10,
              background: reply.trim() ? '#7ab87a' : '#1C1C1C',
              border: 'none', cursor: reply.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.15s',
              opacity: sending ? 0.6 : 1,
            }}
          >
            <PaperPlaneTilt size={16} weight="fill" color={reply.trim() ? '#090909' : '#333'} />
          </button>
        </div>
        <div style={{ fontSize: 10, color: '#333', marginTop: 6 }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}
