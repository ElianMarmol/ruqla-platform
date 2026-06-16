-- Encabezado editable de la página /productos

CREATE TABLE IF NOT EXISTS public.shop_page_header (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  title_highlight TEXT,
  subtitle TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.shop_page_header (eyebrow, title, title_highlight, subtitle)
SELECT
  'Colección RUQLA',
  'Accesorios que',
  'elevan tu día',
  'Piezas con estilo para tu celu, audio y setup — curadas para que combines sin pensar en especificaciones.'
WHERE NOT EXISTS (SELECT 1 FROM public.shop_page_header LIMIT 1);

ALTER TABLE public.shop_page_header ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_page_header_public_read" ON public.shop_page_header;
CREATE POLICY "shop_page_header_public_read"
  ON public.shop_page_header
  FOR SELECT
  TO anon, authenticated
  USING (true);
