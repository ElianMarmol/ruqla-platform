import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ProductDetailView from '@/components/features/ProductDetailView';
import { getProductCategoryIds } from '@/lib/product-category-utils';
import {
  fetchProductById,
  fetchRelatedProducts,
} from '@/lib/product-queries';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    return { title: 'Producto no encontrado | RUQLA' };
  }

  const description =
    product.description?.trim() ||
    `${product.name} — accesorios y tecnología en RUQLA.`;

  return {
    title: `${product.name} | RUQLA`,
    description: description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: description.slice(0, 160),
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await fetchRelatedProducts(
    getProductCategoryIds(product),
    product.id
  );

  return (
    <ProductDetailView product={product} relatedProducts={relatedProducts} />
  );
}
