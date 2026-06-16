import type { OrderStatus } from '../constants';
import { ORDER_STATUSES, ORDERS_PAGE_SIZE } from '../constants';

export type BillingPeriod = 'day' | 'week' | 'month';

export type AdminOrderFilters = {
  status: OrderStatus | null;
  dateFrom: string | null;
  dateTo: string | null;
  page: number;
  billingPeriod: BillingPeriod;
  billingDate: string | null;
  billingMonth: string | null;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

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

  const billingPeriodRaw = pickString(searchParams.billing);
  const billingPeriod: BillingPeriod =
    billingPeriodRaw === 'week' || billingPeriodRaw === 'month'
      ? billingPeriodRaw
      : 'day';

  const billingDateRaw = pickString(searchParams.billingDate);
  const billingDate =
    billingDateRaw && DATE_RE.test(billingDateRaw) ? billingDateRaw : null;

  const billingMonthRaw = pickString(searchParams.billingMonth);
  const billingMonth =
    billingMonthRaw && MONTH_RE.test(billingMonthRaw) ? billingMonthRaw : null;

  return { status, dateFrom, dateTo, page, billingPeriod, billingDate, billingMonth };
}

export function buildAdminSearchParams(
  filters: Partial<AdminOrderFilters>
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.status) params.set('status', filters.status);
  if (filters.dateFrom) params.set('from', filters.dateFrom);
  if (filters.dateTo) params.set('to', filters.dateTo);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  if (filters.billingPeriod && filters.billingPeriod !== 'day') {
    params.set('billing', filters.billingPeriod);
  }
  if (filters.billingDate) params.set('billingDate', filters.billingDate);
  if (filters.billingMonth) params.set('billingMonth', filters.billingMonth);

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

function parseYmd(date: string): { y: number; m: number; d: number } {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m, d };
}

function formatYmd(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function todayYmd(): string {
  const now = new Date();
  return formatYmd(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function currentMonthYm(): string {
  const now = new Date();
  return formatYmd(now.getFullYear(), now.getMonth() + 1, 1).slice(0, 7);
}

export function getCurrentBillingMonth(): string {
  return currentMonthYm();
}

function lastDayOfMonth(y: number, m: number): string {
  return formatYmd(y, m, new Date(y, m, 0).getDate());
}

function addDaysYmd(ymd: string, delta: number): string {
  const { y, m, d } = parseYmd(ymd);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return formatYmd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

export type BillingDateRange = {
  dateFrom: string;
  dateTo: string;
  label: string;
};

/** Rango de fechas para la tarjeta de facturación (órdenes completed). */
export function getBillingDateRange(
  period: BillingPeriod,
  options: { billingDate: string | null; billingMonth: string | null }
): BillingDateRange {
  const { billingDate, billingMonth } = options;

  if (period === 'week') {
    const anchor = billingDate ?? todayYmd();
    const dateFrom = addDaysYmd(anchor, -6);
    return {
      dateFrom,
      dateTo: anchor,
      label: `Últimos 7 días (${formatShortEs(dateFrom)} – ${formatShortEs(anchor)})`,
    };
  }

  if (period === 'month') {
    const monthYm = billingMonth ?? currentMonthYm();
    const [y, m] = monthYm.split('-').map(Number);
    const dateFrom = formatYmd(y, m, 1);
    const isCurrentMonth = monthYm === currentMonthYm();
    const dateTo = isCurrentMonth ? todayYmd() : lastDayOfMonth(y, m);
    const monthLabel = formatMonthLongEs(monthYm);

    let label: string;
    if (isCurrentMonth && dateFrom === dateTo) {
      label = `${monthLabel} · ${formatShortEs(dateFrom)}`;
    } else if (isCurrentMonth) {
      label = `${monthLabel} (${formatShortEs(dateFrom)} – ${formatShortEs(dateTo)})`;
    } else {
      label = monthLabel;
    }

    return { dateFrom, dateTo, label };
  }

  const anchor = billingDate ?? todayYmd();
  return {
    dateFrom: anchor,
    dateTo: anchor,
    label:
      anchor === todayYmd()
        ? 'Hoy'
        : `Día ${formatShortEs(anchor)}`,
  };
}

function formatMonthLongEs(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  const dt = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(dt);
}

function formatShortEs(ymd: string): string {
  const { y, m, d } = parseYmd(ymd);
  const dt = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: y !== new Date().getFullYear() ? 'numeric' : undefined,
  }).format(dt);
}
