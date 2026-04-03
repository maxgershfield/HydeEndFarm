'use client'

import { useEffect, useState } from 'react'
import {
  User, UsersThree, PaperPlaneTilt, MagnifyingGlass,
  CheckCircle, Warning
} from '@phosphor-icons/react'
import { api } from '@/lib/api'
import type { Member } from '@/lib/types'

type Mode = 'individual' | 'broadcast'
type Status = 'idle' | 'sending' | 'success' | 'error'

function WhatsAppPreview({ message, name }: { message: string; name: string }) {
  if (!message) return null
  return (
    <div
      style={{
        background: '#0B1510',
        borderRadius: 12,
        padding: 20,
        border: '0.5px solid #1C1C1C',
      }}
    >
      <div style={{ fontSize: 10, color: '#5C5C5C', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Preview — how {name || 'the member'} sees it
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <div
          className="bubble-in"
          style={{ maxWidth: '85%', padding: '10px 14px', fontSize: 13, lineHeight: 1.6, color: '#E8E8E8', whiteSpace: 'pre-wrap' }}
        >
          {message}
        </div>
      </div>
    </div>
  )
}

export default function Compose() {
  const [mode, setMode] = useState<Mode>('individual')
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Member | null>(null)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [broadcastFilter] = useState('all')

  useEffect(() => {
    api.members().then(setMembers).catch(() => {})
  }, [])

  const filtered = members.filter(m =>
    m.phone && (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
    )
  )

  const charCount = message.length
  const overLimit = charCount > 1024

  async function handleSend() {
    if (!message.trim() || overLimit) return
    if (mode === 'individual' && !selected) return

    setStatus('sending')
    try {
      if (mode === 'individual' && selected?.phone) {
        await api.send(selected.phone, selected.name, message)
        setStatusMsg(`Message sent to ${selected.name}`)
      } else {
        const result = await api.broadcast(message, broadcastFilter)
        setStatusMsg(`Broadcast sent to ${result.sent} member${result.sent !== 1 ? 's' : ''}`)
      }
      setStatus('success')
      setMessage('')
      setSelected(null)
      setSearch('')
    } catch (err: unknown) {
      setStatus('error')
      setStatusMsg(err instanceof Error ? err.message : 'Failed to send')
    }
    setTimeout(() => setStatus('idle'), 4000)
  }

  const recipientLabel = mode === 'broadcast'
    ? `${members.filter(m => m.phone).length} members`
    : selected ? selected.name : 'Select a member'

  return (
    <div style={{ padding: '40px', maxWidth: 820 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Compose</h1>
      <p style={{ fontSize: 14, color: '#5C5C5C', marginBottom: 32 }}>
        WhatsApp via Union API (optional). For Discord + Telegram to tourists’ bridge channels, use the Babelfish panel on the Dashboard.
      </p>

      {/* Mode toggle */}
      <div
        style={{
          display: 'inline-flex',
          background: '#111111',
          border: '0.5px solid #1C1C1C',
          borderRadius: 10,
          padding: 4,
          marginBottom: 28,
          gap: 4,
        }}
      >
        {(['individual', 'broadcast'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setSelected(null); setSearch('') }}
            style={{
              padding: '8px 18px',
              borderRadius: 7,
              border: 'none',
              background: mode === m ? '#7ab87a' : 'transparent',
              color: mode === m ? '#090909' : '#5C5C5C',
              fontSize: 13,
              fontWeight: mode === m ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
          >
            {m === 'individual' ? <User size={14} weight={mode === m ? 'fill' : 'regular'} /> : <UsersThree size={14} weight={mode === m ? 'fill' : 'regular'} />}
            {m === 'individual' ? 'Individual' : 'Broadcast'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Individual: member search */}
          {mode === 'individual' && (
            <div>
              <label style={{ fontSize: 12, color: '#5C5C5C', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recipient
              </label>
              <div style={{ position: 'relative' }}>
                <MagnifyingGlass
                  size={14} color="#5C5C5C"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Search by name or number..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSelected(null) }}
                  style={{
                    width: '100%', padding: '10px 12px 10px 34px',
                    background: '#111111', border: '0.5px solid #1C1C1C',
                    borderRadius: 8, color: '#F0F0F0', fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              {search && !selected && filtered.length > 0 && (
                <div
                  style={{
                    background: '#111111', border: '0.5px solid #1C1C1C',
                    borderRadius: 8, marginTop: 4, overflow: 'hidden',
                    maxHeight: 200, overflowY: 'auto',
                  }}
                >
                  {filtered.slice(0, 8).map(m => (
                    <div
                      key={m.fingerprintId}
                      onClick={() => { setSelected(m); setSearch(m.name) }}
                      style={{
                        padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: '0.5px solid #1C1C1C',
                        transition: 'background 0.1s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = '#171717')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontWeight: 500 }}>{m.name}</span>
                      <span style={{ fontSize: 11, color: '#5C5C5C' }}>{m.phone}</span>
                    </div>
                  ))}
                </div>
              )}
              {search && !selected && filtered.length === 0 && (
                <div style={{ fontSize: 12, color: '#5C5C5C', marginTop: 6, paddingLeft: 4 }}>
                  No members found with a WhatsApp number
                </div>
              )}
            </div>
          )}

          {/* Broadcast: recipient info */}
          {mode === 'broadcast' && (
            <div>
              <label style={{ fontSize: 12, color: '#5C5C5C', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recipients
              </label>
              <div
                style={{
                  padding: '12px 16px', background: '#111111',
                  border: '0.5px solid rgba(122,184,122,0.25)', borderRadius: 8,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <UsersThree size={16} color="#7ab87a" weight="fill" />
                <span style={{ fontSize: 13, color: '#F0F0F0' }}>
                  All members — <strong style={{ color: '#7ab87a' }}>{members.filter(m => m.phone).length}</strong> with WhatsApp
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#5C5C5C', marginTop: 8, lineHeight: 1.5 }}>
                Members without a WhatsApp number will be skipped.
                Tier-based filtering coming soon.
              </p>
            </div>
          )}

          {/* Message editor */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Message
              </label>
              <span style={{ fontSize: 11, color: overLimit ? '#EF4444' : '#5C5C5C' }}>
                {charCount}/1024
              </span>
            </div>
            <textarea
              placeholder={`Write your message...\n\nTip: Use *bold* and _italic_ for WhatsApp formatting.`}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={7}
              style={{
                width: '100%', padding: '12px 14px',
                background: '#111111', border: `0.5px solid ${overLimit ? '#EF4444' : '#1C1C1C'}`,
                borderRadius: 8, color: '#F0F0F0', fontSize: 13,
                fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6,
              }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || overLimit || (mode === 'individual' && !selected) || status === 'sending'}
            style={{
              padding: '12px 20px',
              background: message.trim() && !overLimit && (mode === 'broadcast' || selected) ? '#7ab87a' : '#1C1C1C',
              color: message.trim() && !overLimit && (mode === 'broadcast' || selected) ? '#090909' : '#444',
              border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.15s',
              opacity: status === 'sending' ? 0.7 : 1,
            }}
          >
            <PaperPlaneTilt size={16} weight="fill" />
            {status === 'sending' ? 'Sending...' : (
              mode === 'broadcast'
                ? `Send to ${members.filter(m => m.phone).length} members`
                : `Send to ${recipientLabel}`
            )}
          </button>

          {/* Status feedback */}
          {status === 'success' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4ADE80', fontSize: 13 }}>
              <CheckCircle size={16} weight="fill" />
              {statusMsg}
            </div>
          )}
          {status === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', fontSize: 13 }}>
              <Warning size={16} weight="fill" />
              {statusMsg}
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div>
          <label style={{ fontSize: 12, color: '#5C5C5C', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WhatsApp Preview
          </label>
          <WhatsAppPreview message={message} name={selected?.name ?? (mode === 'broadcast' ? 'members' : '')} />
          {!message && (
            <div
              style={{
                background: '#111111', border: '0.5px solid #1C1C1C', borderRadius: 12,
                padding: '48px 24px', textAlign: 'center', color: '#333', fontSize: 13,
              }}
            >
              Type a message to preview it
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
