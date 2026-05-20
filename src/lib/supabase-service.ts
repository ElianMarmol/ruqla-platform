import { createClient } from '@supabase/supabase-js';

/**
 * Cliente con Service Role para operaciones administrativas de datos (orders).
 * Solo usar en el servidor y detrás de middleware/auth. Nunca en el navegador.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
