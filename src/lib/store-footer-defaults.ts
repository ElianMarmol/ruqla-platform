import type { StoreFooter, StoreFooterLink } from '@/types';

export const DEFAULT_STORE_FOOTER: StoreFooter = {
  id: 'default',
  is_active: true,
  copyright_text: '© {year} RUQLA. Todos los derechos reservados.',
  updated_at: new Date().toISOString(),
};

export const DEFAULT_STORE_FOOTER_LINKS: StoreFooterLink[] = [
  {
    id: 'default-1',
    label: 'Inicio',
    href: '/',
    order_index: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-2',
    label: 'Productos',
    href: '/productos',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-3',
    label: 'Ofertas',
    href: '/productos',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export function formatFooterCopyright(text: string, year = new Date().getFullYear()): string {
  return text.replace(/\{year\}/g, String(year));
}
