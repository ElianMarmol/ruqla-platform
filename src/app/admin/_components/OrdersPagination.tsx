import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ORDERS_PAGE_SIZE } from '../constants';
import { adminHref } from '../lib/filters';
import type { AdminOrderFilters } from '../lib/filters';

type OrdersPaginationProps = {
  filters: AdminOrderFilters;
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

export default function OrdersPagination({
  filters,
  currentPage,
  totalPages,
  totalCount,
}: OrdersPaginationProps) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const prevHref = hasPrev
    ? adminHref({ ...filters, page: currentPage - 1 })
    : null;
  const nextHref = hasNext
    ? adminHref({ ...filters, page: currentPage + 1 })
    : null;

  const rangeStart =
    totalCount === 0 ? 0 : (currentPage - 1) * ORDERS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * ORDERS_PAGE_SIZE, totalCount);

  const linkClass = cn(buttonVariants({ variant: 'outline', size: 'sm' }));

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground font-body">
        {totalCount === 0
          ? 'Sin resultados'
          : `Mostrando ${rangeStart}–${rangeEnd} de ${totalCount} pedidos`}
        {totalPages > 1 && ` · Página ${currentPage} de ${totalPages}`}
      </p>

      <div className="flex items-center gap-2">
        {prevHref ? (
          <Link href={prevHref} className={linkClass}>
            <ChevronLeft />
            Anterior
          </Link>
        ) : (
          <span
            className={cn(linkClass, 'pointer-events-none opacity-50')}
            aria-disabled
          >
            <ChevronLeft />
            Anterior
          </span>
        )}

        {nextHref ? (
          <Link href={nextHref} className={linkClass}>
            Siguiente
            <ChevronRight />
          </Link>
        ) : (
          <span
            className={cn(linkClass, 'pointer-events-none opacity-50')}
            aria-disabled
          >
            Siguiente
            <ChevronRight />
          </span>
        )}
      </div>
    </div>
  );
}
