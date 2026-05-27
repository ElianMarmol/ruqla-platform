'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from './ProductCard';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';

export default function CatalogView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Extraer parámetros actuales de la URL
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || searchParams.get('category_id') || '';

  // 1. Cargar las categorías base directamente para armar los filtros
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // 2. Cargar productos desde la API Route interna dependiendo de los filtros
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const query = new URLSearchParams();
        if (currentSearch) query.set('search', currentSearch);
        if (currentCategory) query.set('category', currentCategory);
        query.set('include_empty_stock', 'true');

        const res = await fetch(`/api/products?${query.toString()}`);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          const apiMessage =
            typeof json.error === 'string'
              ? json.error
              : 'Error al obtener productos';
          throw new Error(apiMessage);
        }

        setProducts(json.data || []);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Error al obtener productos';
        console.error('Error fetching catalog products:', error);
        setProducts([]);
        setFetchError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentSearch, currentCategory]);

  // Manejar click en una categoría
  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Si clickeamos la que ya está activa, la quitamos (toggle)
    params.delete('category');
    params.delete('category_id');
    if (categoryId && categoryId !== currentCategory) {
      params.set('category', categoryId);
    }
    
    // Mantenemos la búsqueda de texto si existía, solo cambiamos la categoría
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar - Filtros por Categoría */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:sticky lg:top-28 backdrop-blur-md">
          <h2 className="font-sans font-bold text-xl mb-6 text-brand-green">Categorías</h2>
          <ul className="space-y-4 font-body">
            <li>
              <button 
                onClick={() => handleCategoryClick('')}
                className={`text-left w-full transition-colors flex items-center justify-between group ${!currentCategory ? 'text-brand-green font-bold' : 'text-gray-400 hover:text-brand-white'}`}
              >
                <span>Todos los productos</span>
                {!currentCategory && <span className="w-2 h-2 rounded-full bg-brand-green"></span>}
              </button>
            </li>
            {categories.map((cat) => {
              const isActive = currentCategory === cat.id || currentCategory === cat.slug;
              return (
                <li key={cat.id}>
                  <button 
                    onClick={() => handleCategoryClick(cat.slug || cat.id)}
                    className={`text-left w-full transition-colors flex items-center justify-between group ${isActive ? 'text-brand-green font-bold' : 'text-gray-400 hover:text-brand-white'}`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    {isActive && <span className="w-2 h-2 flex-shrink-0 rounded-full bg-brand-green"></span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Main Content - Grilla de Productos */}
      <main className="flex-1">
        {/* Cabecera de resultados */}
        {(currentSearch || currentCategory) && (
          <div className="mb-6 flex flex-wrap items-center gap-2 font-body text-gray-400 text-sm">
            Filtros activos:
            {currentSearch && (
              <span className="px-3 py-1 bg-white/10 rounded-full text-brand-white border border-white/20">
                Búsqueda: "{currentSearch}"
              </span>
            )}
            {currentCategory && categories.find(c => c.id === currentCategory || c.slug === currentCategory) && (
              <span className="px-3 py-1 bg-white/10 rounded-full text-brand-white border border-white/20">
                Cat: {categories.find(c => c.id === currentCategory || c.slug === currentCategory)?.name}
              </span>
            )}
            <button 
              onClick={() => router.push('/catalog')}
              className="ml-auto text-brand-green hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Grilla */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse bg-white/5 h-96 rounded-2xl border border-white/10 flex flex-col justify-between p-4">
                <div className="w-full h-48 bg-white/10 rounded-xl mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                </div>
                <div className="h-10 bg-white/10 rounded-full w-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="text-center py-24 bg-destructive/10 rounded-2xl border border-destructive/30 flex flex-col items-center justify-center px-6">
            <p className="text-destructive font-sans text-xl font-bold mb-2">
              No se pudieron cargar los productos
            </p>
            <p className="text-muted-foreground font-body text-sm max-w-md mx-auto mb-4">
              {fetchError}
            </p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="text-sm font-bold text-primary hover:underline"
            >
              Reintentar
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-300 font-sans text-xl font-bold mb-2">No se encontraron productos.</p>
            <p className="text-gray-500 font-body text-sm max-w-md mx-auto">Intentá ajustar los filtros de búsqueda o eliminá algunos términos para ver más resultados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
