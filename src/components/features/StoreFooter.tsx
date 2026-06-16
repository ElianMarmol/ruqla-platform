import Link from 'next/link';

import BrandLogo from '@/components/features/BrandLogo';
import { formatFooterCopyright } from '@/lib/store-footer-defaults';
import type { StoreFooter, StoreFooterLink } from '@/types';

type StoreFooterProps = {
  section: StoreFooter;
  links: StoreFooterLink[];
};

export default function StoreFooter({ section, links }: StoreFooterProps) {
  if (!section.is_active) return null;

  return (
    <footer className="border-t border-border bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <BrandLogo className="h-12 sm:h-14" />
          {links.length > 0 ? (
            <nav className="flex flex-wrap gap-6 text-sm font-body text-muted-foreground">
              {links.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
        <p className="mt-8 text-xs text-muted-foreground font-body">
          {formatFooterCopyright(section.copyright_text)}
        </p>
      </div>
    </footer>
  );
}
