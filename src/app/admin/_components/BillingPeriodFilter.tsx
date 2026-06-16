'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { BillingPeriod } from '../lib/filters';
import { buildAdminSearchParams, getCurrentBillingMonth, parseAdminFilters } from '../lib/filters';

const PERIOD_OPTIONS: { value: BillingPeriod; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Mes' },
];

type BillingUpdate = {
  billingPeriod: BillingPeriod;
  billingDate: string | null;
  billingMonth: string | null;
};

export default function BillingPeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters = parseAdminFilters(
    Object.fromEntries(searchParams.entries())
  );

  const pushBilling = useCallback(
    (next: BillingUpdate) => {
      const params = buildAdminSearchParams({
        ...filters,
        billingPeriod: next.billingPeriod,
        billingDate: next.billingDate,
        billingMonth: next.billingMonth,
        page: filters.page,
      });
      const href = params.toString() ? `/admin?${params.toString()}` : '/admin';
      startTransition(() => router.push(href));
    },
    [filters, router]
  );

  const periodDefaults = (period: BillingPeriod): BillingUpdate => {
    if (period === 'day') {
      return {
        billingPeriod: 'day',
        billingDate: filters.billingDate,
        billingMonth: null,
      };
    }
    if (period === 'month') {
      return {
        billingPeriod: 'month',
        billingDate: null,
        billingMonth: filters.billingMonth,
      };
    }
    return {
      billingPeriod: 'week',
      billingDate: null,
      billingMonth: null,
    };
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 mt-3',
        isPending && 'pointer-events-none opacity-70'
      )}
    >
      <div className="flex flex-wrap gap-1.5">
        {PERIOD_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            size="xs"
            variant={filters.billingPeriod === opt.value ? 'default' : 'outline'}
            className="rounded-full font-bold text-[11px]"
            onClick={() => pushBilling(periodDefaults(opt.value))}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {filters.billingPeriod === 'day' && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="billing-date"
            className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Elegir día
          </label>
          <Input
            id="billing-date"
            type="date"
            className="h-8 text-xs"
            value={filters.billingDate ?? ''}
            onChange={(e) =>
              pushBilling({
                billingPeriod: 'day',
                billingDate: e.target.value || null,
                billingMonth: null,
              })
            }
          />
        </div>
      )}

      {filters.billingPeriod === 'month' && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="billing-month"
            className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Elegir mes
          </label>
          <Input
            id="billing-month"
            type="month"
            className="h-8 text-xs"
            value={filters.billingMonth ?? getCurrentBillingMonth()}
            onChange={(e) =>
              pushBilling({
                billingPeriod: 'month',
                billingDate: null,
                billingMonth: e.target.value || null,
              })
            }
          />
        </div>
      )}
    </div>
  );
}
