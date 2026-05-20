'use client';

import { usePathname } from 'next/navigation';

import Navbar from '@/components/features/Navbar';
import CartDrawer from '@/components/features/CartDrawer';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/context/CartContext';

/** Navbar y carrito solo en rutas públicas del storefront (no en /admin). */
export default function StoreChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Toaster />
    </CartProvider>
  );
}
