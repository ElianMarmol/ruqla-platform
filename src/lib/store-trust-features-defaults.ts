import type {
  StoreTrustFeatures,
  StoreTrustFeaturesItem,
} from '@/types';

export const DEFAULT_STORE_TRUST_FEATURES: StoreTrustFeatures = {
  id: 'default',
  is_active: true,
  updated_at: new Date().toISOString(),
};

export const DEFAULT_STORE_TRUST_FEATURES_ITEMS: StoreTrustFeaturesItem[] = [
  {
    id: 'default-1',
    title: 'Productos Originales',
    description: 'Marcas confiables.',
    icon: 'star',
    order_index: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-2',
    title: 'Garantía',
    description: 'Con garantía oficial.',
    icon: 'shield',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-3',
    title: 'Atención Personalizada',
    description: 'Por WhatsApp.',
    icon: 'message-circle',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-4',
    title: 'Hasta 6 cuotas',
    description: 'Mercado Pago.',
    icon: 'credit-card',
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];
