import Link from 'next/link';

export default function StoreFooter() {
  return (
    <footer className="border-t border-border bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-sans text-xl font-extrabold tracking-tight">
              <span className="text-foreground">RÚ</span>
              <span className="text-primary">qla</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
              Accesorios y Tecnología
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm font-body text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link href="/productos" className="hover:text-primary transition-colors">
              Productos
            </Link>
            <Link href="/productos" className="hover:text-primary transition-colors">
              Ofertas
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()} RUQLA. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
