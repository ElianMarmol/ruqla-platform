/** Ruta pública de ficha de producto (id UUID de Supabase). */
export function getProductHref(productId: string): string {
  return `/productos/${productId}`;
}
