import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types';

/**
 * Cliente Supabase para lecturas públicas en el servidor (Route Handlers, scripts).
 * No usar createBrowserClient en API routes — no está pensado para el runtime de Node.
 */
export function createPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.'
    );
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
