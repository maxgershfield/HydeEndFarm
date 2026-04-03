import type { Image, Product, ProductVariant } from 'lib/medusa/types';

/** Static Hyde End wine list — no Medusa required for catalog. */
const created = new Date('2024-03-15');
const updated = new Date('2025-01-10');

function img(url: string, alt: string): Image {
  return {
    id: url,
    url,
    altText: alt,
    created_at: '',
    updated_at: '',
    deleted_at: null,
    metadata: null
  };
}

function variant(
  id: string,
  productId: string,
  amount: string,
  label: string
): ProductVariant {
  return {
    id,
    product_id: productId,
    inventory_quantity: 500,
    allow_backorder: false,
    manage_inventory: true,
    created_at: '',
    updated_at: '',
    deleted_at: null,
    title: label,
    prices: [
      {
        id: `${id}_price`,
        currency_code: 'gbp',
        amount: Math.round(parseFloat(amount) * 100),
        created_at: '',
        updated_at: '',
        deleted_at: null
      }
    ],
    selectedOptions: [{ name: 'Format', value: label }],
    price: { amount, currencyCode: 'GBP' },
    availableForSale: true,
    options: []
  } as ProductVariant;
}

function wine(p: {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  image: string;
  variantLabel: string;
}): Product {
  const v = variant(`${p.id}_v1`, p.id, p.price, p.variantLabel);
  const featured = { url: p.image, altText: p.title, width: 800, height: 800 };
  return {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    handle: p.handle,
    description: p.description,
    descriptionHtml: `<p>${p.description}</p>`,
    featuredImage: featured,
    images: [img(p.image, p.title)],
    priceRange: { maxVariantPrice: { amount: p.price, currencyCode: 'GBP' } },
    variants: [v],
    options: [
      {
        id: `${p.id}_opt`,
        title: 'Format',
        name: 'Format',
        values: [p.variantLabel],
        availableForSale: true,
        product_id: p.id,
        created_at: '',
        updated_at: '',
        deleted_at: null
      }
    ],
    tags: ['wine', 'hyde-end'],
    availableForSale: true,
    createdAt: created,
    updatedAt: updated,
    is_giftcard: false,
    collection_id: 'hev_wine',
    type_id: 'wine',
    status: 'published'
  } as unknown as Product;
}

const U = 'https://images.unsplash.com';

export const HYDE_WINE_PRODUCTS: Product[] = [
  wine({
    id: 'hev_chardonnay_23',
    handle: 'hyde-end-chardonnay-2023',
    title: 'Hyde End Chardonnay 2023',
    subtitle: 'Berkshire, England',
    description:
      'Barrel-fermented English Chardonnay with crisp orchard fruit, subtle oak, and a long mineral finish. Best with soft cheese or roast chicken.',
    price: '28.00',
    image: `${U}/photo-1510812431401-41d2bd2722f3?w=900&h=900&fit=crop&q=80`,
    variantLabel: '750ml bottle'
  }),
  wine({
    id: 'hev_pinot_22',
    handle: 'hyde-end-pinot-noir-reserve',
    title: 'Hyde End Pinot Noir Reserve',
    subtitle: 'Single parcel',
    description:
      'Cool-climate Pinot with red cherry, earth, and fine tannins. A limited parcel from our steepest rows — cellar for a few years or enjoy now with duck or mushroom dishes.',
    price: '34.00',
    image: `${U}/photo-1553361371-9b22f78e8b1d?w=900&h=900&fit=crop&q=80`,
    variantLabel: '750ml bottle'
  }),
  wine({
    id: 'hev_sparkling_nv',
    handle: 'hyde-end-sparkling-brut',
    title: 'Hyde End Sparkling Brut',
    subtitle: 'Traditional method',
    description:
      'Fine bubbles, green apple, and toasted brioche. Made méthode traditionnelle on the Hyde End farm — perfect for celebrations or Sunday lunch.',
    price: '32.00',
    image: `${U}/photo-1547595628-c61a29f496f0?w=900&h=900&fit=crop&q=80`,
    variantLabel: '750ml bottle'
  }),
  wine({
    id: 'hev_rose_24',
    handle: 'hyde-end-rose-2024',
    title: 'Hyde End Rosé 2024',
    subtitle: 'Dry, Provence-style',
    description:
      'Pale salmon, wild strawberry, and citrus zest. A dry rosé for long evenings on the terrace — pairs with salads, seafood, and sunshine.',
    price: '24.00',
    image: `${U}/photo-1566995541428-f2246c17cda1?w=900&h=900&fit=crop&q=80`,
    variantLabel: '750ml bottle'
  }),
  wine({
    id: 'hev_library_mag',
    handle: 'hyde-end-library-magnum',
    title: 'Library Selection Magnum',
    subtitle: '1.5L — collectors',
    description:
      'A magnum from our library release: bold structure, dark fruit, and years of life ahead. Numbered bottles; ideal for a dinner party centrepiece.',
    price: '78.00',
    image: `${U}/photo-1506377247377-2a5b3b417ebb?w=900&h=900&fit=crop&q=80`,
    variantLabel: '1.5L magnum'
  }),
  wine({
    id: 'hev_tasting_flight',
    handle: 'hyde-end-tasting-flight',
    title: 'Cellar Tasting Flight (mixed case)',
    subtitle: 'Six half-bottles',
    description:
      'A curated mixed case: six 375ml bottles across our current range — the easiest way to discover Hyde End before you commit to full cases.',
    price: '95.00',
    image: `${U}/photo-1474722883778-792e7990302f?w=900&h=900&fit=crop&q=80`,
    variantLabel: 'Mixed 6 × 375ml'
  })
];

export const HYDE_COLLECTION_HANDLE = 'our-wines';

export function getWineByHandle(handle: string): Product | undefined {
  return HYDE_WINE_PRODUCTS.find((p) => p.handle === handle);
}

export function findVariantById(
  variantId: string
): { product: Product; variant: ProductVariant } | undefined {
  for (const product of HYDE_WINE_PRODUCTS) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function getAllWines(): Product[] {
  return [...HYDE_WINE_PRODUCTS];
}

export function filterWines(query?: string): Product[] {
  let list = getAllWines();
  if (query?.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.handle && p.handle.toLowerCase().includes(q))
    );
  }
  return list;
}

export function sortWines(
  products: Product[],
  sortKey?: string,
  reverse?: boolean
): Product[] {
  const out = [...products];
  if (sortKey === 'PRICE') {
    out.sort(
      (a, b) =>
        parseFloat(a.priceRange.maxVariantPrice.amount) -
        parseFloat(b.priceRange.maxVariantPrice.amount)
    );
  } else if (sortKey === 'CREATED_AT') {
    out.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
  }
  if (reverse) out.reverse();
  return out;
}
