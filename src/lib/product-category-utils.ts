import type { Category } from '@/types';

export type ProductCategoryLink = {
  category_id: string;
  categories: Pick<Category, 'id' | 'name' | 'slug'> | null;
};

export type ProductWithCategories = {
  category_id: string | null;
  categories?: Pick<Category, 'id' | 'name' | 'slug'> | null;
  product_categories?: ProductCategoryLink[] | null;
};

export function getProductCategoryIds(product: ProductWithCategories): string[] {
  const fromJoin =
    product.product_categories
      ?.map((row) => row.category_id)
      .filter((id): id is string => Boolean(id)) ?? [];

  if (fromJoin.length > 0) {
    return [...new Set(fromJoin)];
  }

  return product.category_id ? [product.category_id] : [];
}

export function getProductCategoryLabels(product: ProductWithCategories): string[] {
  const fromJoin =
    product.product_categories
      ?.map((row) => row.categories?.name)
      .filter((name): name is string => Boolean(name)) ?? [];

  if (fromJoin.length > 0) {
    return [...new Set(fromJoin)];
  }

  return product.categories?.name ? [product.categories.name] : [];
}
