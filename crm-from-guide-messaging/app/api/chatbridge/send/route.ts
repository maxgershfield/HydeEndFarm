import { NextRequest, NextResponse } from 'next/server'

const oasisBase = () => (process.env.OASIS_API_URL || 'https://api.oasisweb4.com').replace(/\/$/, '')

export async function POST(req: NextRequest) {
  let body: { senderName?: string; text?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }
  const senderName = body.senderName?.trim() || 'Pulmón Guide'
  const text = body.text?.trim()
  if (!text) return NextResponse.json({ message: 'text is required' }, { status: 400 })

  try {
    const r = await fetch(`${oasisBase()}/api/ChatBridge/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderName, text }),
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      return NextResponse.json(err, { status: r.status })
    }
    return NextResponse.json({ sent: true })
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'proxy error' },
      { status: 502 }
    )
  }
}
