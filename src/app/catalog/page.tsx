import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Productos | RUQLA',
};

type CatalogRedirectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogRedirectPage({
  searchParams,
}: CatalogRedirectPageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') qs.set(key, value);
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
  }

  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  redirect(`/productos${suffix}`);
}
