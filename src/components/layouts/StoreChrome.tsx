'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';

import Navbar from '@/components/features/Navbar';
import CartDrawer from '@/components/features/CartDrawer';
import StoreFooter from '@/components/features/StoreFooter';
import WhatsAppFab from '@/components/features/WhatsAppFab';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/context/CartContext';
import type { StoreNavLinkWithCategory } from '@/lib/nav-link-resolve';

/** Navbar y carrito solo en rutas públicas del storefront (no en /admin). */
export default function StoreChrome({
  children,
  topBar,
  navLinks = [],
}: {
  children: React.ReactNode;
  topBar?: React.ReactNode;
  navLinks?: StoreNavLinkWithCategory[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isHome = pathname === '/';

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Suspense
        fallback={
          <header className="sticky top-0 z-50 h-16 bg-background border-b border-border" />
        }
      >
        <Navbar topBar={topBar} navLinks={navLinks} />
      </Suspense>
      <CartDrawer />
      <main className="flex-1 bg-background">{children}</main>
      {!isHome ? <StoreFooter /> : null}
      <WhatsAppFab />
      <Toaster />
    </CartProvider>
  );
}
