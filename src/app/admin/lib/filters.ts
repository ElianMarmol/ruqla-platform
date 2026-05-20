import type { OrderStatus } from '../constants';
import { ORDER_STATUSES, ORDERS_PAGE_SIZE } from '../constants';

export type AdminOrderFilters = {
  status: OrderStatus | null;
  dateFrom: string | null;
  dateTo: string | null;
  page: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function pickString(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export function parseAdminFilters(
  searchParams: Record<string, string | string[] | undefined>
): AdminOrderFilters {
  const statusRaw = pickString(searchParams.status);
  const status = ORDER_STATUSES.includes(statusRaw as OrderStatus)
    ? (statusRaw as OrderStatus)
    : null;

  const dateFromRaw = pickString(searchParams.from);
  const dateFrom =
    dateFromRaw && DATE_RE.test(dateFromRaw) ? dateFromRaw : null;

  const dateToRaw = pickString(searchParams.to);
  const dateTo = dateToRaw && DATE_RE.test(dateToRaw) ? dateToRaw : null;

  const pageRaw = parseInt(pickString(searchParams.page) ?? '1', 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return { status, dateFrom, dateTo, page };
}

export function buildAdminSearchParams(
  filters: Partial<AdminOrderFilters>
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.status) params.set('status', filters.status);
  if (filters.dateFrom) params.set('from', filters.dateFrom);
  if (filters.dateTo) params.set('to', filters.dateTo);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));

  return params;
}

export function adminHref(filters: Partial<AdminOrderFilters>): string {
  const query = buildAdminSearchParams(filters).toString();
  return query ? `/admin?${query}` : '/admin';
}

export function startOfDayIso(date: string): string {
  return `${date}T00:00:00.000Z`;
}

export function endOfDayIso(date: string): string {
  return `${date}T23:59:59.999Z`;
}

export function getPaginationRange(page: number): { from: number; to: number } {
  const from = (page - 1) * ORDERS_PAGE_SIZE;
  const to = from + ORDERS_PAGE_SIZE - 1;
  return { from, to };
}
