import type { StoreNavLink, StoreSettings } from '@/types';

export const DEFAULT_WHATSAPP_NUMBER = '5493513205892';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: 'default',
  whatsapp_number: DEFAULT_WHATSAPP_NUMBER,
  updated_at: new Date().toISOString(),
};

export const DEFAULT_STORE_NAV_LINKS: StoreNavLink[] = [
  {
    id: 'default-1',
    label: 'CARGADORES',
    category_id: null,
    fallback_slug: 'cargadores-cables',
    order_index: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-2',
    label: 'FUNDAS',
    category_id: null,
    fallback_slug: 'fundas',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-3',
    label: 'AURICULARES',
    category_id: null,
    fallback_slug: 'auriculares',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-4',
    label: 'OFERTAS',
    category_id: null,
    fallback_slug: 'ofertas',
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];
