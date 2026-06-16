import type { StoreTopBar, StoreTopBarItem } from '@/types';

export const DEFAULT_STORE_TOP_BAR: StoreTopBar = {
  id: 'default',
  is_active: true,
  updated_at: new Date().toISOString(),
};

export const DEFAULT_STORE_TOP_BAR_ITEMS: StoreTopBarItem[] = [
  {
    id: 'default-1',
    label: 'Envíos a todo el país',
    icon: 'truck',
    order_index: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-2',
    label: '3 y 6 cuotas sin interés con Mercado Pago',
    icon: 'credit-card',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-3',
    label: 'Compra 100% segura',
    icon: 'shield-check',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];
