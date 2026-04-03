'use client';

import CartModal from 'components/cart/modal';
import OpenCart from 'components/cart/open-cart';
import type { Cart } from 'lib/medusa/types';
import type { Menu } from 'lib/medusa/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MobileMenu from './mobile-menu';
import Search from './search';

export default function NavbarClient() {
  const [menu, setMenu] = useState<Menu[]>([]);
  const [cart, setCart] = useState<Cart | null | undefined>(undefined);
  const [clock, setClock] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/header-menu').then((r) => r.json()),
      fetch('/api/cart', { credentials: 'include' }).then((r) => r.json())
    ])
      .then(([menuData, cartData]) => {
        setMenu(Array.isArray(menuData) ? menuData : []);
        setCart(cartData?.cart ?? null);
      })
      .catch(() => { setMenu([]); setCart(null); });
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const p = (n: number) => String(n).padStart(2, '0');
      setClock(`${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const menuList = Array.isArray(menu) ? menu : [];

  return (
    <nav
      style={{
        height: 48,
        background: 'rgba(12,6,8,0.96)',
        borderBottom: '1px solid rgba(196,120,108,0.35)',
        boxShadow: '0 0 24px rgba(139,58,74,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Left: logo + nav links ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flex: 1 }}>

        {/* Mobile menu trigger */}
        <div className="block md:hidden">
          <MobileMenu menu={menuList} />
        </div>

        {/* Wordmark */}
        <Link
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            textDecoration: 'none', flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>
            🍇
          </span>
          <span
            className="font-display"
            style={{
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.06em',
              color: '#e8d4a0',
            }}
          >
            Hyde End
          </span>
          <span style={{ color: 'rgba(196,120,108,0.45)', fontSize: '0.65rem' }}>·</span>
          <span
            className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-hev-muted"
          >
            Cellar door
          </span>
        </Link>

        {/* Nav links */}
        {menuList.length > 0 && (
          <ul className="hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', listStyle: 'none', margin: 0, padding: 0 }}>
            {menuList.map((item: Menu) => (
              <li key={item.title}>
                <Link
                  href={item.path ?? '#'}
                  className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-hev-muted transition-colors hover:text-hev-gold"
                  style={{
                    textDecoration: 'none',
                    padding: '0.2rem 0.7rem',
                  }}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Center: status indicator (desktop only) ── */}
      <div className="hidden md:flex items-center gap-2 font-display text-[0.5rem] uppercase tracking-[0.2em] text-hev-gold">
        <span
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#5a9b8c',
            boxShadow: '0 0 6px rgba(90,155,140,0.6)',
            animation: 'pulse 2.2s ease-in-out infinite',
            display: 'inline-block',
          }}
        />
        English wine · UK shipping
      </div>

      {/* ── Right: search + clock + cart ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end', flex: 1 }}>
        <div className="hidden md:block">
          <Search />
        </div>
        {clock && (
          <span className="hidden md:block font-mono text-[0.6rem] tracking-wide text-hev-muted/70">
            {clock}
          </span>
        )}
        {cart !== undefined ? (
          <CartModal cart={cart ?? undefined} />
        ) : (
          <OpenCart />
        )}
      </div>
    </nav>
  );
}
