import type { HomeCatalogCard, HomeCatalogSection } from '@/types';

export const DEFAULT_HOME_CATALOG_SECTION: HomeCatalogSection = {
  id: 'default',
  title: 'Equipá tu Setup',
  subtitle:
    'Explorá nuestro catálogo de periféricos, componentes de alta gama y accesorios premium para potenciar tu experiencia.',
  is_active: true,
  updated_at: new Date().toISOString(),
};

export const DEFAULT_HOME_CATALOG_CARDS: HomeCatalogCard[] = [
  {
    id: 'default-1',
    title: 'Fundas y Protectores',
    icon: 'box',
    category_id: null,
    fallback_slug: 'fundas',
    order_index: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    categories: { slug: 'fundas' },
  },
  {
    id: 'default-2',
    title: 'Cargadores Rápidos',
    icon: 'zap',
    category_id: null,
    fallback_slug: 'cargadores-cables',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    categories: { slug: 'cargadores-cables' },
  },
  {
    id: 'default-3',
    title: 'Componentes PC',
    icon: 'monitor',
    category_id: null,
    fallback_slug: 'componentes',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    categories: { slug: 'componentes' },
  },
];
