-- Pie de página del storefront (enlaces y copyright)

CREATE TABLE IF NOT EXISTS public.store_footer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  copyright_text TEXT NOT NULL DEFAULT '© {year} RUQLA. Todos los derechos reservados.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.store_footer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.store_footer (is_active, copyright_text)
SELECT true, '© {year} RUQLA. Todos los derechos reservados.'
WHERE NOT EXISTS (SELECT 1 FROM public.store_footer LIMIT 1);

INSERT INTO public.store_footer_links (label, href, order_index, is_active)
SELECT v.label, v.href, v.order_index, true
FROM (VALUES
  ('Inicio', '/', 0),
  ('Productos', '/productos', 1),
  ('Ofertas', '/productos', 2)
) AS v(label, href, order_index)
WHERE NOT EXISTS (SELECT 1 FROM public.store_footer_links LIMIT 1);

ALTER TABLE public.store_footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_footer_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_footer_public_read" ON public.store_footer;
CREATE POLICY "store_footer_public_read"
  ON public.store_footer FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "store_footer_links_public_read" ON public.store_footer_links;
CREATE POLICY "store_footer_links_public_read"
  ON public.store_footer_links FOR SELECT TO anon, authenticated USING (true);
