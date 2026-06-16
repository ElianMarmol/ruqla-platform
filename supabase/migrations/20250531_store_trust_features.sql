-- Barra de beneficios / confianza en la portada (debajo del catálogo)

CREATE TABLE IF NOT EXISTS public.store_trust_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.store_trust_features_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'star',
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.store_trust_features (is_active)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM public.store_trust_features LIMIT 1);

INSERT INTO public.store_trust_features_items (title, description, icon, order_index, is_active)
SELECT v.title, v.description, v.icon, v.order_index, true
FROM (VALUES
  ('Productos Originales', 'Marcas confiables.', 'star', 0),
  ('Garantía', 'Con garantía oficial.', 'shield', 1),
  ('Atención Personalizada', 'Por WhatsApp.', 'message-circle', 2),
  ('Hasta 6 cuotas', 'Mercado Pago.', 'credit-card', 3)
) AS v(title, description, icon, order_index)
WHERE NOT EXISTS (SELECT 1 FROM public.store_trust_features_items LIMIT 1);

ALTER TABLE public.store_trust_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_trust_features_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_trust_features_public_read" ON public.store_trust_features;
CREATE POLICY "store_trust_features_public_read"
  ON public.store_trust_features FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "store_trust_features_items_public_read" ON public.store_trust_features_items;
CREATE POLICY "store_trust_features_items_public_read"
  ON public.store_trust_features_items FOR SELECT TO anon, authenticated USING (true);
