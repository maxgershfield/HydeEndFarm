'use server';

import { findVariantById } from 'lib/hyde-wine-catalog';
import {
  HYDE_CART_COOKIE,
  parseHydeCartCookie,
  writeHydeCartCookie,
  type RawHydeCart
} from 'lib/hyde-cart';
import { cookies } from 'next/headers';

function newHydeCartId() {
  return `hyde_${globalThis.crypto?.randomUUID?.() ?? String(Date.now())}`;
}

function newLineId() {
  return `line_${globalThis.crypto?.randomUUID?.() ?? String(Date.now())}`;
}

function loadRaw(): RawHydeCart {
  const parsed = parseHydeCartCookie(cookies().get(HYDE_CART_COOKIE)?.value);
  if (parsed) return parsed;
  const fresh: RawHydeCart = { id: newHydeCartId(), lines: [] };
  writeHydeCartCookie(cookies(), fresh);
  return fresh;
}

export const addItem = async (variantId: string | undefined): Promise<String | undefined> => {
  if (!variantId) return 'Missing product variant ID';
  if (!findVariantById(variantId)) return 'Unknown product';

  const raw = loadRaw();
  const hit = raw.lines.find((l) => l.variantId === variantId);
  if (hit) hit.quantity += 1;
  else raw.lines.push({ lineId: newLineId(), variantId, quantity: 1 });
  writeHydeCartCookie(cookies(), raw);
};

export const removeItem = async (lineId: string): Promise<String | undefined> => {
  const raw = parseHydeCartCookie(cookies().get(HYDE_CART_COOKIE)?.value);
  if (!raw) return undefined;
  raw.lines = raw.lines.filter((l) => l.lineId !== lineId);
  writeHydeCartCookie(cookies(), raw);
};

export const updateItemQuantity = async ({
  lineId,
  quantity
}: {
  lineId: string;
  variantId: string;
  quantity: number;
}): Promise<String | undefined> => {
  const raw = parseHydeCartCookie(cookies().get(HYDE_CART_COOKIE)?.value);
  if (!raw) return 'Missing cart';
  const line = raw.lines.find((l) => l.lineId === lineId);
  if (line) line.quantity = quantity;
  writeHydeCartCookie(cookies(), raw);
};
