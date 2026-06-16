import type { ShopPageHeader } from '@/types';

export const DEFAULT_SHOP_PAGE_HEADER: ShopPageHeader = {
  id: 'default',
  eyebrow: 'Colección RUQLA',
  title: 'Accesorios que',
  title_highlight: 'elevan tu día',
  subtitle:
    'Piezas con estilo para tu celu, audio y setup — curadas para que combines sin pensar en especificaciones.',
  is_active: true,
  updated_at: new Date().toISOString(),
};
