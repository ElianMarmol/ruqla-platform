'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Search, ShoppingCart, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BrandLogo from '@/components/features/BrandLogo';
import { useCart } from '@/context/CartContext';
import {
  getNavLinkCategorySlug,
  getNavLinkHref,
  type StoreNavLinkWithCategory,
} from '@/lib/nav-link-resolve';
import { isSameCategory, type CategoryRef } from '@/lib/category-resolve';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type NavbarProps = {
  topBar?: React.ReactNode;
  navLinks?: StoreNavLinkWithCategory[];
};

export default function Navbar({ topBar, navLinks = [] }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cartCount, isCartHydrated, openCart } = useCart();
  const urlCategory = searchParams.get('category') || '';

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, slug, name')
        .order('name');
      if (data) setCategories(data);
    };
    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isNavLinkActive = (link: StoreNavLinkWithCategory) => {
    if (pathname !== '/productos' && pathname !== '/catalog') return false;
    if (!urlCategory) return false;

    const slug = getNavLinkCategorySlug(link);
    if (!slug) return false;

    if (categories.length === 0) {
      return slug === urlCategory;
    }

    return isSameCategory(urlCategory, slug, categories);
  };

  const isProductosActive =
    (pathname === '/productos' || pathname === '/catalog') && !urlCategory;

  return (
    <header className="sticky top-0 z-50 bg-background shadow-sm border-b border-border">
      {topBar}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[var(--store-nav-row-height)] gap-3">
          <BrandLogo className="h-9 md:h-10" />

          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link
              href="/"
              className={cn(
                'font-sans text-[11px] font-bold tracking-wide transition-colors',
                pathname === '/'
                  ? 'text-primary underline underline-offset-4 decoration-2'
                  : 'text-foreground hover:text-primary'
              )}
            >
              INICIO
            </Link>
            <Link
              href="/productos"
              className={cn(
                'font-sans text-[11px] font-bold tracking-wide transition-colors flex items-center gap-0.5',
                isProductosActive
                  ? 'text-primary underline underline-offset-4 decoration-2'
                  : 'text-foreground hover:text-primary'
              )}
            >
              PRODUCTOS
              <ChevronDown className="size-3 opacity-60" />
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={getNavLinkHref(link)}
                className={cn(
                  'font-sans text-[11px] font-bold tracking-wide transition-colors',
                  isNavLinkActive(link)
                    ? 'text-primary underline underline-offset-4 decoration-2'
                    : 'text-foreground hover:text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-foreground hover:text-primary hover:bg-accent lg:hidden"
              onClick={() => router.push('/productos')}
              aria-label="Buscar productos"
            >
              <Search className="size-4" />
            </Button>

            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center max-w-[180px] lg:max-w-[11rem]"
            >
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="h-8 rounded-full border-border bg-muted/50 text-xs px-3"
              />
            </form>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-foreground hover:text-primary hover:bg-accent"
              aria-label="Mi cuenta"
            >
              <User className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="relative text-foreground hover:text-primary hover:bg-accent"
              onClick={openCart}
              aria-label="Carrito"
            >
              <ShoppingCart className="size-4" />
              {isCartHydrated && cartCount > 0 ? (
                <Badge className="absolute -top-1 -right-1 size-5 min-w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-2 border-background">
                  {cartCount}
                </Badge>
              ) : null}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
