'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChartBar, PaperPlaneTilt, ChatCircle, Lightning, Gear } from '@phosphor-icons/react'

/** Same structure as The Union messaging sidebar — Pulmón jungle moss accent */
const MOSS = '#7ab87a'

const NAV = [
  { href: '/', label: 'Dashboard', Icon: ChartBar },
  { href: '/compose', label: 'Compose', Icon: PaperPlaneTilt },
  { href: '/conversations', label: 'Conversations', Icon: ChatCircle },
  { href: '/automations', label: 'Automations', Icon: Lightning },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: '#050d09',
        borderRight: '0.5px solid rgba(122, 184, 122, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        height: '100vh',
        position: 'sticky',
        top: 0,
        boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.25)',
      }}
    >
      {/* Wordmark — Union layout; Pulmón identity */}
      <div style={{ padding: '0 20px 28px', borderBottom: '0.5px solid rgba(122, 184, 122, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: 'rgba(122, 184, 122, 0.1)',
              border: '0.5px solid rgba(122, 184, 122, 0.28)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            🌿
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.06em',
                color: '#e8f0e4',
                textTransform: 'uppercase',
              }}
            >
              Pulmón Verde
            </div>
            <div
              style={{
                fontSize: 10,
                color: '#5a7a62',
                letterSpacing: '0.12em',
                marginTop: 2,
                textTransform: 'uppercase',
              }}
            >
              The Guide · Messaging
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? MOSS : '#6a8a72',
                background: active ? 'rgba(122, 184, 122, 0.08)' : 'transparent',
                transition: 'all 0.15s',
                borderLeft: active ? `2px solid ${MOSS}` : '2px solid transparent',
              }}
            >
              <Icon size={16} weight={active ? 'fill' : 'regular'} color={active ? MOSS : '#6a8a72'} />
              {label}
            </Link>
          )
        })}

        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '0.5px solid rgba(122, 184, 122, 0.1)',
          }}
        >
          <Link
            href="/advanced"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 10px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: path.startsWith('/advanced') ? 600 : 400,
              color: path.startsWith('/advanced') ? MOSS : '#4a6a52',
              background: path.startsWith('/advanced') ? 'rgba(122, 184, 122, 0.06)' : 'transparent',
              borderLeft: path.startsWith('/advanced') ? `2px solid ${MOSS}` : '2px solid transparent',
            }}
          >
            <Gear size={15} weight={path.startsWith('/advanced') ? 'fill' : 'regular'} />
            OASIS & WhatsApp
          </Link>
        </div>
      </nav>

      <div
        style={{
          padding: '16px 20px',
          borderTop: '0.5px solid rgba(122, 184, 122, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: MOSS,
              boxShadow: '0 0 8px rgba(122, 184, 122, 0.5)',
            }}
          />
          <span style={{ fontSize: 11, color: '#6a8a72' }}>Conservation layer</span>
        </div>
        <div style={{ fontSize: 10, color: '#3a5a42', marginTop: 6, lineHeight: 1.4 }}>
          Reserva Pulmón Verde · Yucatán
        </div>
      </div>
    </aside>
  )
}
