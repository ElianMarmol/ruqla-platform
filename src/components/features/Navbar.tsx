'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart } from 'lucide-react'; // shadcn usually comes with lucide-react

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { cartCount, openCart } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-background text-foreground sticky top-0 z-50 shadow-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Placeholder */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Icono Logo */}
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(159,192,48,0.4)]">
                <span className="text-primary-foreground font-sans font-bold text-xl">R</span>
              </div>
              {/* Texto Logo */}
              <span className="font-sans font-extrabold text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                RUQLA
              </span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative group flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input
                type="text"
                className="w-full pl-12 pr-28 py-6 bg-accent/5 border-border rounded-full text-foreground placeholder-muted-foreground focus-visible:ring-primary focus-visible:ring-2 focus-visible:border-transparent transition-all duration-300 font-body"
                placeholder="Buscar fundas, cargadores, componentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="absolute right-1.5 rounded-full font-bold px-6 py-5 hover:shadow-[0_0_12px_rgba(159,192,48,0.6)] transition-all duration-300"
              >
                Buscar
              </Button>
            </form>
          </div>

          {/* Nav Links / Cart Placeholder */}
          <div className="flex items-center gap-6">
            <Link href="/catalog" className="font-sans font-semibold text-foreground hover:text-primary transition-colors duration-200 hidden sm:block">
              Catálogo
            </Link>
            
            {/* Cart Icon */}
            <Button 
              onClick={openCart}
              variant="ghost"
              size="icon"
              className="relative text-foreground hover:text-primary hover:bg-transparent group"
            >
              <ShoppingCart className="h-6 w-6 transform group-hover:scale-110 transition-transform" />
              {/* Badge */}
              {cartCount > 0 && (
                <Badge variant="default" className="absolute -top-2 -right-2 px-1.5 min-w-[20px] h-5 flex items-center justify-center text-[10px] shadow-sm border border-background">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}
