import { Suspense } from 'react';
import CatalogView from '@/components/features/CatalogView';

export const metadata = {
  title: 'Catálogo | RUQLA',
  description: 'Explora nuestra amplia variedad de componentes, fundas y accesorios premium.',
};

export default function CatalogPage() {
  return (
    <div className="bg-brand-black min-h-screen text-brand-white">
      {/* Banner Superior Decorativo */}
      <div className="w-full bg-white/5 border-b border-white/10 pt-16 pb-12 mb-12 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-white/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl mb-4 tracking-tight">
            Descubrí nuestro <span className="text-brand-green">Catálogo</span>
          </h1>
          <p className="font-body text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Componentes premium y accesorios tecnológicos seleccionados especialmente para vos.
          </p>
        </div>
      </div>

      {/* Contenido Principal con Suspense para uso seguro de useSearchParams */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Suspense 
          fallback={
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
              <p className="font-sans font-bold text-gray-400">Cargando catálogo...</p>
            </div>
          }
        >
          <CatalogView />
        </Suspense>
      </div>
    </div>
  );
}
