import { NextResponse } from 'next/server'

const bridgeBase = () => (process.env.GUIDE_TELEGRAM_BRIDGE_URL || 'http://127.0.0.1:3847').replace(/\/$/, '')

export async function GET() {
  const token = process.env.GUIDE_TELEGRAM_BRIDGE_ADMIN_TOKEN?.trim()
  if (!token) {
    return NextResponse.json({ chatIds: [], message: 'GUIDE_TELEGRAM_BRIDGE_ADMIN_TOKEN not set' }, { status: 200 })
  }
  try {
    const r = await fetch(`${bridgeBase()}/api/admin/recent-chat-ids`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      return NextResponse.json({ chatIds: [], error: (data as { error?: string }).error ?? r.statusText }, { status: 200 })
    }
    return NextResponse.json({ chatIds: (data as { chatIds?: string[] }).chatIds ?? [] })
  } catch (e) {
    return NextResponse.json(
      { chatIds: [], error: e instanceof Error ? e.message : 'proxy error' },
      { status: 200 }
    )
  }
}
