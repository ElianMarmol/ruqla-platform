import Link from 'next/link';

import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  href?: string;
};

export default function BrandLogo({
  className,
  href = '/',
}: BrandLogoProps) {
  const image = (
    <img
      src="/logo-ruqla.png"
      alt="RUQLA"
      width={240}
      height={74}
      className={cn(
        'block h-14 w-auto max-w-none object-contain object-left',
        className
      )}
      decoding="async"
      fetchPriority="high"
    />
  );

  if (!href) return image;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}
