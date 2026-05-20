'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterX, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type { OrderStatus } from '../constants';
import { STATUS_FILTER_OPTIONS } from '../constants';
import { buildAdminSearchParams } from '../lib/filters';

const STATUS_ALL = '__all__';

function parseStatusParam(value: string): OrderStatus | null {
  if (value === 'pending' || value === 'completed' || value === 'cancelled') {
    return value;
  }
  return null;
}

export default function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get('status') ?? '';
  const currentFrom = searchParams.get('from') ?? '';
  const currentTo = searchParams.get('to') ?? '';

  const [status, setStatus] = useState(currentStatus);
  const [from, setFrom] = useState(currentFrom);
  const [to, setTo] = useState(currentTo);

  useEffect(() => {
    setStatus(searchParams.get('status') ?? '');
    setFrom(searchParams.get('from') ?? '');
    setTo(searchParams.get('to') ?? '');
  }, [searchParams]);

  const hasActiveFilters = Boolean(currentStatus || currentFrom || currentTo);

  const pushFilters = useCallback(
    (values: { status: string; from: string; to: string }) => {
      const params = buildAdminSearchParams({
        status: parseStatusParam(values.status),
        dateFrom: values.from || null,
        dateTo: values.to || null,
        page: 1,
      });

      const href = params.toString() ? `/admin?${params.toString()}` : '/admin';

      startTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    pushFilters({ status, from, to });
  };

  const clearFilters = () => {
    setStatus('');
    setFrom('');
    setTo('');
    startTransition(() => {
      router.push('/admin');
    });
  };

  const statusSelectValue = status || STATUS_ALL;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col gap-3 border-b border-border/60 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-end',
        isPending && 'pointer-events-none opacity-70'
      )}
    >
      <div className="flex min-w-[160px] flex-col gap-1.5">
        <label
          htmlFor="admin-filter-status"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Estado
        </label>
        <Select
          value={statusSelectValue}
          onValueChange={(value) =>
            setStatus(value === STATUS_ALL ? '' : String(value))
          }
          items={Object.fromEntries(
            STATUS_FILTER_OPTIONS.map((opt) => [
              opt.value || STATUS_ALL,
              opt.label,
            ])
          )}
        >
          <SelectTrigger
            id="admin-filter-status"
            className="w-full min-w-[140px] h-8"
          >
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 text-foreground border-border/60">
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value || 'all'}
                value={opt.value || STATUS_ALL}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-[160px] flex-col gap-1.5">
        <label
          htmlFor="admin-filter-from"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Desde
        </label>
        <Input
          id="admin-filter-from"
          name="from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>

      <div className="flex min-w-[160px] flex-col gap-1.5">
        <label
          htmlFor="admin-filter-to"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Hasta
        </label>
        <Input
          id="admin-filter-to"
          name="to"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <Button type="submit" size="sm" className="sm:mb-0.5 font-bold">
        <Search />
        Filtrar
      </Button>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="sm:mb-0.5"
        >
          <FilterX />
          Limpiar
        </Button>
      )}
    </form>
  );
}
