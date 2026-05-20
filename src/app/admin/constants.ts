export const ORDERS_PAGE_SIZE = 10;

export const ORDER_STATUSES = ['pending', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
] as const;
