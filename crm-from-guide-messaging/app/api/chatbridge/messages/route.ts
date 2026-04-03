import { NextRequest, NextResponse } from 'next/server'

const oasisBase = () => (process.env.OASIS_API_URL || 'https://api.oasisweb4.com').replace(/\/$/, '')

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get('limit') ?? '100'
  try {
    const r = await fetch(`${oasisBase()}/api/ChatBridge/messages?limit=${encodeURIComponent(limit)}`, {
      cache: 'no-store',
    })
    const data = await r.json().catch(() => [])
    return NextResponse.json(data, { status: r.ok ? 200 : r.status })
  } catch {
    return NextResponse.json([], { status: 502 })
  }
}
