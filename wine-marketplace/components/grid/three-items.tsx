import { GridTileImage } from 'components/grid/tile';
import { getCategoryProducts, getProducts } from 'lib/medusa';
import type { Product } from 'lib/medusa/types';
import Link from 'next/link';

function ThreeItemGridItem({
  item,
  size,
  priority
}: {
  item: Product;
  size: 'full' | 'half';
  priority?: boolean;
}) {
  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link className="relative block aspect-square h-full w-full" href={`/product/${item.handle}`}>
        <GridTileImage
          src={item.featuredImage.url}
          fill
          sizes={
            size === 'full' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'
          }
          priority={priority}
          alt={item.title}
          label={{
            position: size === 'full' ? 'center' : 'bottom',
            title: item.title as string,
            amount: item.priceRange.maxVariantPrice.amount,
            currencyCode: item.priceRange.maxVariantPrice.currencyCode
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  // Prefer featured category; fall back to first 3 products so the shop shows something when Medusa is up.
  let homepageItems = await getCategoryProducts('our-wines');
  if (!homepageItems[0] || !homepageItems[1] || !homepageItems[2]) {
    const allProducts = await getProducts({});
    homepageItems = allProducts.slice(0, 3);
  }

  if (!homepageItems[0] || !homepageItems[1] || !homepageItems[2]) {
    return (
      <section className="mx-auto max-w-screen-2xl px-4 pb-16 pt-8">
        <div className="rounded-2xl border border-hev-border bg-hev-panel p-16 text-center">
          <h2 className="mb-4 font-display text-2xl text-hev-gold">Hyde End Cellar Door</h2>
          <p className="mb-6 text-hev-muted">
            Browse English wine from the vineyard — bottles ship UK-wide (demo catalog).
          </p>
          <p className="text-sm text-hev-muted/80">
            If this box appears, the wine catalog failed to load. Refresh or open{' '}
            <Link href="/search" className="text-hev-gold underline">
              /search
            </Link>
            .
          </p>
        </div>
      </section>
    );
  }

  const [firstProduct, secondProduct, thirdProduct] = homepageItems;

  return (
    <section className="mx-auto grid max-w-screen-2xl gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2">
      <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" item={thirdProduct} />
    </section>
  );
}
