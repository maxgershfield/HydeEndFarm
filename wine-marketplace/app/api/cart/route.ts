import {
  HYDE_CART_COOKIE,
  parseHydeCartCookie,
  rawToStorefrontCart,
  writeHydeCartCookie,
  type RawHydeCart
} from 'lib/hyde-cart';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function newHydeCartId() {
  return `hyde_${globalThis.crypto?.randomUUID?.() ?? String(Date.now())}`;
}

export async function GET(request: NextRequest) {
  let raw: RawHydeCart | null = parseHydeCartCookie(request.cookies.get(HYDE_CART_COOKIE)?.value);
  if (!raw) raw = { id: newHydeCartId(), lines: [] };
  const res = NextResponse.json({ cart: rawToStorefrontCart(raw) });
  writeHydeCartCookie(res.cookies, raw);
  return res;
}
