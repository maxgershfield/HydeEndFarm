import { NextResponse } from 'next/server'

const oasisBase = () => (process.env.OASIS_API_URL || 'https://api.oasisweb4.com').replace(/\/$/, '')

export async function GET() {
  try {
    const r = await fetch(`${oasisBase()}/api/ChatBridge/status`, { cache: 'no-store' })
    const data = await r.json().catch(() => ({}))
    return NextResponse.json(data, { status: r.ok ? 200 : r.status })
  } catch (e) {
    return NextResponse.json(
      { enabled: false, error: e instanceof Error ? e.message : 'proxy error' },
      { status: 502 }
    )
  }
}
