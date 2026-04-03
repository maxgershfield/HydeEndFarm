import { NextResponse } from 'next/server'

const bridgeBase = () => (process.env.GUIDE_TELEGRAM_BRIDGE_URL || 'http://127.0.0.1:3847').replace(/\/$/, '')

export async function GET() {
  try {
    const r = await fetch(`${bridgeBase()}/health`, { cache: 'no-store' })
    const data = await r.json().catch(() => ({}))
    return NextResponse.json(data, { status: r.ok ? 200 : 502 })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'unreachable' },
      { status: 502 }
    )
  }
}
