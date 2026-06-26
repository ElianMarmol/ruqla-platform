import { getTopBarIcon } from '@/lib/top-bar-icons';
import type { StoreTrustFeaturesItem } from '@/types';

type TrustFeaturesBarProps = {
  items: StoreTrustFeaturesItem[];
  compact?: boolean;
};

function formatItemLabel(item: StoreTrustFeaturesItem): string {
  if (!item.description?.trim()) return item.title;
  return `${item.title} · ${item.description.trim()}`;
}

export default function TrustFeaturesBar({ items }: TrustFeaturesBarProps) {
  if (!items.length) return null;

  return (
    <section className="home-trust shrink-0 grow-0 bg-primary text-primary-foreground text-[11px] sm:text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-1.5 font-body font-medium">
          {items.map((item) => {
            const Icon = getTopBarIcon(item.icon);
            return (
              <li key={item.id} className="flex items-center gap-1.5">
                <Icon className="size-3 shrink-0 opacity-90" aria-hidden />
                <span>{formatItemLabel(item)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
