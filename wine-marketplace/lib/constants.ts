export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: 'RELEVANCE' | 'BEST_SELLING' | 'CREATED_AT' | 'PRICE';
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: 'Relevance',
  slug: null,
  sortKey: 'RELEVANCE',
  reverse: false
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  { title: 'Trending', slug: 'trending-desc', sortKey: 'BEST_SELLING', reverse: false }, // asc
  { title: 'Latest arrivals', slug: 'latest-desc', sortKey: 'CREATED_AT', reverse: true },
  { title: 'Price: Low to high', slug: 'price-asc', sortKey: 'PRICE', reverse: false }, // asc
  { title: 'Price: High to low', slug: 'price-desc', sortKey: 'PRICE', reverse: true }
];

export const TAGS = {
  categories: 'categories',
  products: 'products'
};

export const HIDDEN_PRODUCT_TAG = 'nextjs-frontend-hidden';
export const DEFAULT_OPTION = 'Default Title';

export const CHECKOUT_PAGE_PROPS = {
  title: 'Checkout',
  body: `This Hyde End demo uses a local cart (cookie) for browsing. For production, connect payments (Stripe, Medusa checkout, or concierge invoicing) and age verification where required.`,
  description: 'Checkout placeholder — wire payments for production',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
};
