import { NextResponse } from 'next/server'

const bridgeBase = () => (process.env.GUIDE_TELEGRAM_BRIDGE_URL || 'http://127.0.0.1:3847').replace(/\/$/, '')

export async function GET() {
  const token = process.env.GUIDE_TELEGRAM_BRIDGE_ADMIN_TOKEN?.trim()
  if (!token) {
    return NextResponse.json({ avatars: [], message: 'GUIDE_TELEGRAM_BRIDGE_ADMIN_TOKEN not set' }, { status: 200 })
  }
  try {
    const r = await fetch(`${bridgeBase()}/api/admin/linked-oasis-avatars`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      return NextResponse.json(
        { avatars: [], error: (data as { error?: string }).error ?? r.statusText },
        { status: 200 }
      )
    }
    const avatars = (data as { avatars?: unknown[] }).avatars
    return NextResponse.json({ avatars: Array.isArray(avatars) ? avatars : [] })
  } catch (e) {
    return NextResponse.json(
      { avatars: [], error: e instanceof Error ? e.message : 'proxy error' },
      { status: 200 }
    )
  }
}
