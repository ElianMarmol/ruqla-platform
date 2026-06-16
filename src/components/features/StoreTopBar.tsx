import { CreditCard, ShieldCheck, Truck } from 'lucide-react';

const ITEMS = [
  { icon: Truck, label: 'Envíos a todo el país' },
  { icon: CreditCard, label: '3 y 6 cuotas sin interés con Mercado Pago' },
  { icon: ShieldCheck, label: 'Compra 100% segura' },
] as const;

export default function StoreTopBar() {
  return (
    <div className="bg-primary text-primary-foreground text-[11px] sm:text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-1.5 font-body font-medium">
          {ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1.5">
              <Icon className="size-3 shrink-0 opacity-90" aria-hidden />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
