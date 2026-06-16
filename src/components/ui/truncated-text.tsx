'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type TruncatedTextProps = {
  text: string;
  className?: string;
  lines?: 1 | 2;
};

/** Texto con ellipsis; tooltip nativo solo si el contenido queda recortado. */
export function TruncatedText({
  text,
  className,
  lines = 1,
}: TruncatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const truncated =
        lines === 1
          ? el.scrollWidth > el.clientWidth
          : el.scrollHeight > el.clientHeight;
      setIsTruncated(truncated);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, lines]);

  return (
    <span
      ref={ref}
      title={isTruncated ? text : undefined}
      className={cn(
        'block min-w-0 max-w-full',
        lines === 1 ? 'truncate' : 'line-clamp-2',
        className
      )}
    >
      {text}
    </span>
  );
}
