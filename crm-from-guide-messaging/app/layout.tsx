import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Pulmón Verde — The Guide · Messaging',
  description: 'Operator messaging — Telegram for visitors; Union-style layout, jungle theme',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          margin: 0,
        }}
      >
        <Sidebar />
        <main className="pv-main" style={{ flex: 1, overflow: 'auto', height: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
