-- Configuración de contacto (WhatsApp) y enlaces del menú principal

CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number TEXT NOT NULL DEFAULT '5493513205892',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.store_nav_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  fallback_slug TEXT NOT NULL DEFAULT '',
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.store_settings (whatsapp_number)
SELECT '5493513205892'
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings LIMIT 1);

INSERT INTO public.store_nav_links (label, fallback_slug, order_index, is_active)
SELECT v.label, v.fallback_slug, v.order_index, true
FROM (VALUES
  ('CARGADORES', 'cargadores-cables', 0),
  ('FUNDAS', 'fundas', 1),
  ('AURICULARES', 'auriculares', 2),
  ('OFERTAS', 'ofertas', 3)
) AS v(label, fallback_slug, order_index)
WHERE NOT EXISTS (SELECT 1 FROM public.store_nav_links LIMIT 1);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_nav_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_settings_public_read" ON public.store_settings;
CREATE POLICY "store_settings_public_read"
  ON public.store_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "store_nav_links_public_read" ON public.store_nav_links;
CREATE POLICY "store_nav_links_public_read"
  ON public.store_nav_links FOR SELECT TO anon, authenticated USING (true);
