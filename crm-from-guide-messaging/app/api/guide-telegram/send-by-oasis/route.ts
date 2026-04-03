import { NextRequest, NextResponse } from 'next/server'

const bridgeBase = () => (process.env.GUIDE_TELEGRAM_BRIDGE_URL || 'http://127.0.0.1:3847').replace(/\/$/, '')

export async function POST(req: NextRequest) {
  const token = process.env.GUIDE_TELEGRAM_BRIDGE_ADMIN_TOKEN?.trim()
  if (!token) {
    return NextResponse.json(
      { message: 'GUIDE_TELEGRAM_BRIDGE_ADMIN_TOKEN is not set on the Next server' },
      { status: 503 }
    )
  }

  let body: { oasisUsername?: string; text?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (!text) return NextResponse.json({ message: 'text is required' }, { status: 400 })

  const oasisUsername = typeof body.oasisUsername === 'string' ? body.oasisUsername.trim() : ''
  if (!oasisUsername) {
    return NextResponse.json({ message: 'oasisUsername is required (OASIS avatar username)' }, { status: 400 })
  }

  try {
    const r = await fetch(`${bridgeBase()}/api/send-by-oasis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oasisUsername, text }),
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      return NextResponse.json(err, { status: r.status })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'proxy error' },
      { status: 502 }
    )
  }
}
