import { getTopBarIcon } from '@/lib/top-bar-icons';
import type { StoreTopBarItem } from '@/types';

type StoreTopBarProps = {
  items: Pick<StoreTopBarItem, 'id' | 'label' | 'icon'>[];
};

export default function StoreTopBar({ items }: StoreTopBarProps) {
  return (
    <div className="bg-primary text-primary-foreground text-[11px] sm:text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 py-1 font-body font-medium min-h-[var(--store-top-bar-height)]">
          {items.map((item) => {
            const Icon = getTopBarIcon(item.icon);
            return (
              <li key={item.id} className="flex items-center gap-1.5">
                <Icon className="size-3 shrink-0 opacity-90" aria-hidden />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
