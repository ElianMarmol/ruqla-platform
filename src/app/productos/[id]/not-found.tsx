import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ProductoNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
        RUQLA
      </p>
      <h1 className="font-sans text-2xl font-extrabold text-foreground mb-2">
        Producto no encontrado
      </h1>
      <p className="font-body text-muted-foreground max-w-md mb-8">
        Ese accesorio ya no está en la tienda o el enlace no es válido.
      </p>
      <Link
        href="/productos"
        className={cn(buttonVariants(), 'rounded-full font-bold px-6')}
      >
        Ir a la tienda
      </Link>
    </div>
  );
}
