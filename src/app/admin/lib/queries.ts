import { supabaseService } from '@/lib/supabase-service';
import type { Order } from '@/types';

import { ORDERS_PAGE_SIZE } from '../constants';
import type { AdminOrderFilters } from './filters';
import { endOfDayIso, getPaginationRange, startOfDayIso } from './filters';

export type AdminMetrics = {
  facturacionTotal: number;
  pedidosPendientes: number;
  totalPedidos: number;
};

export type PaginatedOrdersResult = {
  orders: Order[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

/** Métricas del panel. La facturación respeta el rango de fechas indicado. */
export async function fetchAdminMetrics(billingRange: {
  dateFrom: string;
  dateTo: string;
}): Promise<AdminMetrics> {
  const [
    { data: completedRows, error: completedError },
    { count: pendingCount, error: pendingError },
    { count: totalCount, error: totalError },
  ] = await Promise.all([
    supabaseService
      .from('orders')
      .select('total')
      .eq('status', 'completed')
      .gte('created_at', startOfDayIso(billingRange.dateFrom))
      .lte('created_at', endOfDayIso(billingRange.dateTo)),
    supabaseService
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabaseService.from('orders').select('*', { count: 'exact', head: true }),
  ]);

  if (completedError) throw completedError;
  if (pendingError) throw pendingError;
  if (totalError) throw totalError;

  const facturacionTotal =
    (completedRows as { total: number }[] | null)?.reduce(
      (acc, row) => acc + Number(row.total || 0),
      0
    ) ?? 0;

  return {
    facturacionTotal,
    pedidosPendientes: pendingCount ?? 0,
    totalPedidos: totalCount ?? 0,
  };
}

export async function fetchPaginatedOrders(
  filters: AdminOrderFilters
): Promise<PaginatedOrdersResult> {
  let countQuery = supabaseService
    .from('orders')
    .select('id', { count: 'exact', head: true });

  if (filters.status) {
    countQuery = countQuery.eq('status', filters.status);
  }
  if (filters.dateFrom) {
    countQuery = countQuery.gte('created_at', startOfDayIso(filters.dateFrom));
  }
  if (filters.dateTo) {
    countQuery = countQuery.lte('created_at', endOfDayIso(filters.dateTo));
  }

  const { count: filteredCount, error: countError } = await countQuery;
  if (countError) throw countError;

  const totalCount = filteredCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ORDERS_PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, filters.page), totalPages);
  const { from, to } = getPaginationRange(currentPage);

  let dataQuery = supabaseService.from('orders').select('*');

  if (filters.status) {
    dataQuery = dataQuery.eq('status', filters.status);
  }
  if (filters.dateFrom) {
    dataQuery = dataQuery.gte('created_at', startOfDayIso(filters.dateFrom));
  }
  if (filters.dateTo) {
    dataQuery = dataQuery.lte('created_at', endOfDayIso(filters.dateTo));
  }

  const { data, error } = await dataQuery
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    orders: data ?? [],
    totalCount,
    totalPages,
    currentPage,
  };
}
