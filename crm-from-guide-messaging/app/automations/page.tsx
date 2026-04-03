'use client'

import { useEffect, useState } from 'react'
import { Lightning, PencilSimple, CheckCircle, Warning } from '@phosphor-icons/react'
import { api } from '@/lib/api'
import type { Automation } from '@/lib/types'

function AutomationCard({ auto, onSave }: {
  auto: Automation
  onSave: (id: string, patch: Partial<Automation>) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState(auto.message)
  const [enabled, setEnabled] = useState(auto.enabled)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await onSave(auto.id, { message, enabled })
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2500)
  }

  async function toggleEnabled() {
    const next = !enabled
    setEnabled(next)
    await onSave(auto.id, { enabled: next })
  }

  return (
    <div
      style={{
        background: '#111111',
        border: `0.5px solid ${enabled ? 'rgba(122,184,122,0.2)' : '#1C1C1C'}`,
        borderRadius: 12,
        padding: '20px 24px',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: enabled ? 'rgba(122,184,122,0.12)' : '#1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `0.5px solid ${enabled ? 'rgba(122,184,122,0.25)' : '#262626'}`,
            }}
          >
            <Lightning size={15} weight="fill" color={enabled ? '#7ab87a' : '#333'} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#F0F0F0' }}>{auto.name}</div>
            <div style={{ fontSize: 12, color: '#5C5C5C', marginTop: 2 }}>{auto.description}</div>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={toggleEnabled}
          style={{
            width: 44, height: 24, borderRadius: 12,
            background: enabled ? '#7ab87a' : '#1C1C1C',
            border: `0.5px solid ${enabled ? '#7ab87a' : '#2A2A2A'}`,
            cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 3, left: enabled ? 23 : 3,
              width: 16, height: 16, borderRadius: '50%',
              background: enabled ? '#090909' : '#333',
              transition: 'left 0.2s',
            }}
          />
        </button>
      </div>

      {/* Config details */}
      {auto.inactiveDays && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Trigger after
          </label>
          <div style={{ fontSize: 13, color: '#A0A0A0', marginTop: 4 }}>
            {auto.inactiveDays} days without a check-in
          </div>
        </div>
      )}
      {auto.karmaThreshold && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Trigger when
          </label>
          <div style={{ fontSize: 13, color: '#A0A0A0', marginTop: 4 }}>
            Member is within {auto.karmaThreshold} karma of a discount threshold
          </div>
        </div>
      )}

      {/* Message display / edit */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 11, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Message template
          </label>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7ab87a', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}
            >
              <PencilSimple size={12} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            style={{
              width: '100%', padding: '10px 12px',
              background: '#171717', border: '0.5px solid #262626',
              borderRadius: 8, color: '#F0F0F0', fontSize: 12,
              fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6,
            }}
          />
        ) : (
          <div
            style={{
              padding: '10px 12px',
              background: '#0D0D0D', border: '0.5px solid #1A1A1A',
              borderRadius: 8, fontSize: 12, color: '#A0A0A0',
              lineHeight: 1.6, whiteSpace: 'pre-wrap',
            }}
          >
            {message}
          </div>
        )}
      </div>

      {/* Variables hint */}
      <div style={{ fontSize: 11, color: '#333', marginBottom: editing ? 14 : 0 }}>
        Variables: <code style={{ color: '#5C5C5C' }}>{'{name}'}</code>
        {auto.id === 'karma_nudge' && <> <code style={{ color: '#5C5C5C' }}>{'{remaining}'}</code></>}
        {auto.id === 'milestone_celebration' && <> <code style={{ color: '#5C5C5C' }}>{'{milestone}'}</code> <code style={{ color: '#5C5C5C' }}>{'{bonus}'}</code></>}
      </div>

      {editing && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: '8px 18px', background: '#7ab87a', color: '#090909',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => { setEditing(false); setMessage(auto.message) }}
            style={{
              padding: '8px 18px', background: 'transparent', color: '#5C5C5C',
              border: '0.5px solid #1C1C1C', borderRadius: 8, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ADE80', fontSize: 12, marginTop: 8 }}>
          <CheckCircle size={13} weight="fill" /> Saved
        </div>
      )}
    </div>
  )
}

export default function Automations() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.automations()
      .then(a => { setAutomations(a); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  async function handleSave(id: string, patch: Partial<Automation>) {
    await api.updateAutomation(id, patch)
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))
  }

  return (
    <div style={{ padding: '40px', maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Automations</h1>
      <p style={{ fontSize: 14, color: '#5C5C5C', marginBottom: 32 }}>
        Automated WhatsApp messages triggered by member behaviour.
        Runs are scheduled via the union-api server.
      </p>

      {loading && (
        <div style={{ color: '#5C5C5C', fontSize: 13 }}>Loading automations...</div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', fontSize: 13, marginBottom: 20 }}>
          <Warning size={16} weight="fill" />
          Could not load automations — is union-api running?
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {automations.map(a => (
          <AutomationCard key={a.id} auto={a} onSave={handleSave} />
        ))}
      </div>

      {/* Info panel */}
      <div
        style={{
          marginTop: 32,
          padding: '16px 20px',
          background: '#111111',
          border: '0.5px solid #1C1C1C',
          borderRadius: 12,
          fontSize: 12, color: '#5C5C5C', lineHeight: 1.7,
        }}
      >
        <div style={{ fontWeight: 600, color: '#A0A0A0', marginBottom: 8 }}>How automations fire</div>
        Automations are evaluated by the union-api server on a schedule. The <strong style={{ color: '#A0A0A0' }}>win-back</strong> job
        runs daily and checks the last session date for each member. The <strong style={{ color: '#A0A0A0' }}>karma nudge</strong> runs
        after each check-in. Milestone messages fire in real time when a member hits a session milestone.
        <br /><br />
        Note: WhatsApp Cloud API requires an approved message template for members who have not messaged in the last 24 hours.
        For the sandbox / dev number, free-form messages are always allowed.
      </div>
    </div>
  )
}
