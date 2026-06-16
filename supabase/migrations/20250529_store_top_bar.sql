-- Barra superior del storefront (envíos, cuotas, etc.)

CREATE TABLE IF NOT EXISTS public.store_top_bar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.store_top_bar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'truck',
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.store_top_bar (is_active)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM public.store_top_bar LIMIT 1);

INSERT INTO public.store_top_bar_items (label, icon, order_index, is_active)
SELECT v.label, v.icon, v.order_index, true
FROM (VALUES
  ('Envíos a todo el país', 'truck', 0),
  ('3 y 6 cuotas sin interés con Mercado Pago', 'credit-card', 1),
  ('Compra 100% segura', 'shield-check', 2)
) AS v(label, icon, order_index)
WHERE NOT EXISTS (SELECT 1 FROM public.store_top_bar_items LIMIT 1);

ALTER TABLE public.store_top_bar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_top_bar_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_top_bar_public_read" ON public.store_top_bar;
CREATE POLICY "store_top_bar_public_read"
  ON public.store_top_bar FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "store_top_bar_items_public_read" ON public.store_top_bar_items;
CREATE POLICY "store_top_bar_items_public_read"
  ON public.store_top_bar_items FOR SELECT TO anon, authenticated USING (true);
