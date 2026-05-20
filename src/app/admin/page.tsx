import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Banknote, ClipboardList, Clock, TrendingUp } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import OrderFilters from './_components/OrderFilters';
import OrderRowActions from './_components/OrderRowActions';
import OrdersPagination from './_components/OrdersPagination';
import StatusBadge from './_components/StatusBadge';
import { adminHref, parseAdminFilters } from './lib/filters';
import { fetchAdminMetrics, fetchPaginatedOrders } from './lib/queries';

export const metadata = {
  title: 'Admin · Pedidos | RUQLA',
  description: 'Panel de administración de órdenes RUQLA.',
};

export const dynamic = 'force-dynamic';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function FiltersFallback() {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 sm:flex-row sm:flex-wrap">
      <Skeleton className="h-14 w-40" />
      <Skeleton className="h-14 w-40" />
      <Skeleton className="h-14 w-40" />
    </div>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const resolvedParams = await searchParams;
  const filters = parseAdminFilters(resolvedParams);

  let metrics;
  let paginated;

  try {
    [metrics, paginated] = await Promise.all([
      fetchAdminMetrics(),
      fetchPaginatedOrders(filters),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return (
      <main className="min-h-screen bg-[#050505] text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-sans text-3xl font-extrabold tracking-tight mb-4">
            Panel de Administración
          </h1>
          <p className="text-destructive font-body">
            No se pudieron cargar los pedidos: {message}
          </p>
        </div>
      </main>
    );
  }

  const { orders, totalCount, totalPages, currentPage } = paginated;
  const { facturacionTotal, pedidosPendientes, totalPedidos } = metrics;

  if (filters.page !== currentPage && totalCount > 0) {
    redirect(adminHref({ ...filters, page: currentPage }));
  }

  const hasActiveFilters = Boolean(
    filters.status || filters.dateFrom || filters.dateTo
  );

  return (
    <main className="min-h-screen bg-[#050505] text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
            RUQLA · Admin
          </p>
          <h1 className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight">
            Panel de Pedidos
          </h1>
          <p className="text-muted-foreground font-body mt-2 max-w-2xl">
            Gestioná órdenes auditadas desde el checkout por WhatsApp. Las canceladas no
            impactan la facturación; solo las completadas suman al total.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Card className="bg-card border border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription className="font-body uppercase tracking-wider text-xs">
                  Facturación
                </CardDescription>
                <span className="text-emerald-400">
                  <TrendingUp />
                </span>
              </div>
              <CardTitle className="font-sans text-2xl font-extrabold text-foreground">
                {currencyFormatter.format(facturacionTotal)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground font-body">
                Solo órdenes <span className="text-emerald-300">completed</span> (excluye
                canceladas y pendientes).
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription className="font-body uppercase tracking-wider text-xs">
                  Pedidos pendientes
                </CardDescription>
                <span className="text-amber-300">
                  <Clock />
                </span>
              </div>
              <CardTitle className="font-sans text-2xl font-extrabold text-foreground">
                {pedidosPendientes}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground font-body">
                Órdenes esperando confirmación de pago.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription className="font-body uppercase tracking-wider text-xs">
                  Total de pedidos
                </CardDescription>
                <span className="text-foreground/80">
                  <ClipboardList />
                </span>
              </div>
              <CardTitle className="font-sans text-2xl font-extrabold text-foreground">
                {totalPedidos}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground font-body">
                Conteo histórico en la tabla <code className="text-foreground">orders</code>.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <Banknote className="text-primary" />
              <h2 className="font-sans text-lg font-bold">Pedidos</h2>
            </div>
            <span className="text-xs text-muted-foreground font-body">
              {hasActiveFilters
                ? `${totalCount} resultado${totalCount === 1 ? '' : 's'} filtrado${totalCount === 1 ? '' : 's'}`
                : `${totalPedidos} en total`}
            </span>
          </div>

          <Suspense fallback={<FiltersFallback />}>
            <OrderFilters />
          </Suspense>

          {orders.length === 0 ? (
            <div className="px-5 py-16 text-center text-muted-foreground font-body">
              {hasActiveFilters
                ? 'No hay pedidos que coincidan con los filtros seleccionados.'
                : 'Aún no hay pedidos registrados.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">ID</th>
                      <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                      <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                      <th className="px-4 py-3 text-left font-semibold">Teléfono</th>
                      <th className="px-4 py-3 text-right font-semibold">Total</th>
                      <th className="px-4 py-3 text-left font-semibold">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-border/40 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-foreground/90">
                          {dateFormatter.format(new Date(order.created_at))}
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground">
                          {order.customer_name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {order.customer_phone ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-foreground whitespace-nowrap">
                          {currencyFormatter.format(Number(order.total || 0))}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <OrderRowActions order={order} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <OrdersPagination
                filters={{ ...filters, page: currentPage }}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
