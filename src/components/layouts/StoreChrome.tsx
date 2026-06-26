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
import type {
  StoreFooter as StoreFooterData,
  StoreFooterLink,
} from '@/types';

/** Navbar y carrito solo en rutas públicas del storefront (no en /admin). */
export default function StoreChrome({
  children,
  topBar,
  navLinks = [],
  footerSection,
  footerLinks = [],
}: {
  children: React.ReactNode;
  topBar?: React.ReactNode;
  navLinks?: StoreNavLinkWithCategory[];
  footerSection: StoreFooterData;
  footerLinks?: StoreFooterLink[];
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
          <header className="sticky top-0 z-50 h-[var(--store-header-height)] bg-background border-b border-border" />
        }
      >
        <Navbar topBar={topBar} navLinks={navLinks} />
      </Suspense>
      <CartDrawer />
      <main className="flex-1 bg-background">{children}</main>
      {!isHome ? (
        <StoreFooter section={footerSection} links={footerLinks} />
      ) : null}
      <WhatsAppFab />
      <Toaster />
    </CartProvider>
  );
}
