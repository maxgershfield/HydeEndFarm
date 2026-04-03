import { DEFAULT_OPTION } from 'lib/constants';
import { findVariantById } from 'lib/hyde-wine-catalog';
import type { Cart, CartItem, MedusaProductVariant, Product, ProductVariant } from 'lib/medusa/types';
import { cookies } from 'next/headers';

export const HYDE_CART_COOKIE = 'hydeCart';

export type RawHydeCart = {
  id: string;
  lines: Array<{ lineId: string; variantId: string; quantity: number }>;
};

function newId(prefix: string) {
  return `${prefix}_${globalThis.crypto?.randomUUID?.() ?? String(Date.now())}`;
}

export function parseHydeCartCookie(val: string | undefined): RawHydeCart | null {
  if (!val) return null;
  try {
    const p = JSON.parse(val) as RawHydeCart;
    if (p?.id && Array.isArray(p.lines)) return p;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeHydeCartCookie(jar: { set: (n: string, v: string, o: object) => void }, raw: RawHydeCart) {
  jar.set(HYDE_CART_COOKIE, JSON.stringify(raw), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 60
  });
}

function writeRawCart(raw: RawHydeCart) {
  writeHydeCartCookie(cookies(), raw);
}

export function getOrCreateRawCartFromCookies(): RawHydeCart {
  const parsed = parseHydeCartCookie(cookies().get(HYDE_CART_COOKIE)?.value);
  if (parsed) return parsed;
  const fresh: RawHydeCart = { id: newId('hyde'), lines: [] };
  writeRawCart(fresh);
  return fresh;
}

function lineUnitPence(variant: MedusaProductVariant): number {
  const p = variant.prices?.[0];
  if (p?.amount != null) return p.amount;
  return 0;
}

function toCartItem(line: RawHydeCart['lines'][0], product: Product, variant: MedusaProductVariant): CartItem {
  const pv = variant as ProductVariant;
  const unit = lineUnitPence(variant) / 100;
  const total = (unit * line.quantity).toFixed(2);
  const currency = 'GBP';

  return {
    id: line.lineId,
    title: product.title,
    description: variant.title ?? DEFAULT_OPTION,
    thumbnail: product.featuredImage?.url ?? '',
    quantity: line.quantity,
    variant_id: variant.id,
    variant,
    is_return: false,
    is_giftcard: false,
    should_merge: true,
    allow_discounts: true,
    unit_price: lineUnitPence(variant),
    subtotal: Math.round(unit * line.quantity * 100),
    tax_total: 0,
    total: Math.round(unit * line.quantity * 100),
    original_total: Math.round(unit * line.quantity * 100),
    original_tax_total: 0,
    discount_total: 0,
    raw_discount_total: 0,
    gift_card_total: 0,
    includes_tax: true,
    refundable: Math.round(unit * line.quantity * 100),
    created_at: new Date(),
    updated_at: new Date(),
    merchandise: {
      id: variant.id,
      selectedOptions: pv.selectedOptions ?? [],
      product,
      title: DEFAULT_OPTION
    },
    cost: {
      totalAmount: { amount: total, currencyCode: currency }
    }
  } as CartItem;
}

export function rawToStorefrontCart(raw: RawHydeCart): Cart {
  const lines: CartItem[] = [];
  for (const line of raw.lines) {
    const found = findVariantById(line.variantId);
    if (!found) continue;
    lines.push(toCartItem(line, found.product, found.variant as MedusaProductVariant));
  }

  const totalQty = lines.reduce((a, b) => a + b.quantity, 0);
  let sub = 0;
  for (const li of lines) {
    sub += parseFloat(li.cost.totalAmount.amount || '0');
  }
  const subStr = sub.toFixed(2);

  return {
    id: raw.id,
    lines,
    totalQuantity: totalQty,
    checkoutUrl: '/checkout',
    cost: {
      subtotalAmount: { amount: subStr, currencyCode: 'GBP' },
      totalAmount: { amount: subStr, currencyCode: 'GBP' },
      totalTaxAmount: { amount: '0.00', currencyCode: 'GBP' }
    },
    region: {
      id: 'reg_hyde',
      name: 'UK',
      currency_code: 'gbp',
      tax_code: '',
      tax_rate: 0,
      country_code: 'gb',
      created_at: '',
      updated_at: '',
      deleted_at: null,
      metadata: null
    },
    region_id: 'reg_hyde',
    billing_address_id: '',
    type: 'default',
    created_at: '',
    updated_at: '',
    deleted_at: null
  } as unknown as Cart;
}
