'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Search, ShoppingCart, User } from 'lucide-react';

import StoreTopBar from '@/components/features/StoreTopBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import {
  type CategoryNavKey,
  type CategoryRef,
  CATEGORY_NAV_KEYS,
  findCategoryForNavKey,
  getCategoryHref,
  isSameCategory,
} from '@/lib/category-resolve';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const CATEGORY_NAV: { key: CategoryNavKey; label: string }[] = [
  { key: 'cargadores', label: 'CARGADORES' },
  { key: 'fundas', label: 'FUNDAS' },
  { key: 'auriculares', label: 'AURICULARES' },
  { key: 'ofertas', label: 'OFERTAS' },
];

export default function Navbar() {
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

  const categoryLinks = CATEGORY_NAV.map(({ key, label }) => ({
    key,
    label,
    href:
      categories.length > 0
        ? getCategoryHref(key, categories)
        : `/productos?category=${encodeURIComponent(CATEGORY_NAV_KEYS[key][0])}`,
  }));

  const isCategoryLinkActive = (
    navKey: CategoryNavKey,
    href: string
  ) => {
    if (pathname !== '/productos' && pathname !== '/catalog') return false;
    if (!urlCategory) return false;

    const param = href.split('category=')[1]?.split('&')[0];
    if (!param) return navKey === 'ofertas' && !urlCategory;

    const hrefSlug = decodeURIComponent(param);
    if (categories.length === 0) {
      return hrefSlug === urlCategory;
    }

    const navCategory = findCategoryForNavKey(navKey, categories);
    if (!navCategory) return hrefSlug === urlCategory;

    return isSameCategory(urlCategory, navCategory.slug, categories);
  };

  const isProductosActive =
    (pathname === '/productos' || pathname === '/catalog') && !urlCategory;

  return (
    <header className="sticky top-0 z-50 bg-background shadow-sm border-b border-border">
      <StoreTopBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          <Link href="/" className="flex flex-col shrink-0 group">
            <span className="font-sans text-2xl font-extrabold leading-none tracking-tight">
              <span className="text-foreground">RÚ</span>
              <span className="text-primary">qla</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-body mt-0.5">
              Accesorios y Tecnología
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            <Link
              href="/"
              className={cn(
                'font-sans text-xs font-bold tracking-wide transition-colors',
                pathname === '/'
                  ? 'text-primary underline underline-offset-8 decoration-2'
                  : 'text-foreground hover:text-primary'
              )}
            >
              INICIO
            </Link>
            <Link
              href="/productos"
              className={cn(
                'font-sans text-xs font-bold tracking-wide transition-colors flex items-center gap-0.5',
                isProductosActive
                  ? 'text-primary underline underline-offset-8 decoration-2'
                  : 'text-foreground hover:text-primary'
              )}
            >
              PRODUCTOS
              <ChevronDown className="size-3.5 opacity-60" />
            </Link>
            {categoryLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  'font-sans text-xs font-bold tracking-wide transition-colors',
                  isCategoryLinkActive(link.key, link.href)
                    ? 'text-primary underline underline-offset-8 decoration-2'
                    : 'text-foreground hover:text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-primary hover:bg-accent lg:hidden"
              onClick={() => router.push('/productos')}
              aria-label="Buscar productos"
            >
              <Search className="size-5" />
            </Button>

            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center max-w-[200px] lg:max-w-xs"
            >
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="h-9 rounded-full border-border bg-muted/50 text-sm"
              />
            </form>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-primary hover:bg-accent"
              aria-label="Mi cuenta"
            >
              <User className="size-5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative text-foreground hover:text-primary hover:bg-accent"
              onClick={openCart}
              aria-label="Carrito"
            >
              <ShoppingCart className="size-5" />
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
