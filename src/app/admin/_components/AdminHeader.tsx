import Link from 'next/link';
import { Home, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { signOutAction } from '../actions/auth';

const navLinkClass =
  'text-sm font-body text-muted-foreground hover:text-primary transition-colors';

export default function AdminHeader() {
  return (
    <header className="border-b border-border/60 bg-[#050505]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link
            href="/admin"
            className="font-sans font-extrabold text-lg tracking-tight text-foreground hover:text-primary transition-colors shrink-0"
          >
            RUQLA <span className="text-primary">Admin</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4">
            <Link href="/admin" className={navLinkClass}>
              Pedidos
            </Link>
            <Link href="/admin/products" className={navLinkClass}>
              Productos
            </Link>
            <Link
              href="/admin/home-cms"
              className={`${navLinkClass} inline-flex items-center gap-1.5`}
            >
              <Home className="size-4 shrink-0" />
              Portada
            </Link>
          </nav>
        </div>

        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </header>
  );
}
