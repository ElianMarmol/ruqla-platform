-- Varias categorías por producto (ej. cargador en Informática y en Cargadores)

CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_category_id
  ON public.product_categories (category_id);

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, p.category_id
FROM public.products p
WHERE p.category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_categories_public_read" ON public.product_categories;
CREATE POLICY "product_categories_public_read"
  ON public.product_categories FOR SELECT TO anon, authenticated USING (true);
