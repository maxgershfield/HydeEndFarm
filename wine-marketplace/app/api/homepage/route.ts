import { getAllWines } from 'lib/hyde-wine-catalog';
import { getMenu } from 'lib/medusa';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const wines = getAllWines();
    const [first, second, third] = wines;
    const gridProducts =
      first && second && third ? [first, second, third] : wines.slice(0, 3);
    const footerMenu = await getMenu('next-js-frontend-footer-menu');

    return NextResponse.json({
      gridProducts,
      carouselProducts: wines,
      footerMenu: Array.isArray(footerMenu) ? footerMenu : []
    });
  } catch {
    return NextResponse.json({
      gridProducts: [],
      carouselProducts: [],
      footerMenu: []
    });
  }
}
