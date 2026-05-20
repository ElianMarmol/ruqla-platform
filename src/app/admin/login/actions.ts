'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { error: 'Completá email y contraseña.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login Error:', error.message);
    return { error: 'Credenciales inválidas.' };
  }

  const next = String(formData.get('next') || '').trim();
  redirect(next && next.startsWith('/admin') ? next : '/admin');
}
