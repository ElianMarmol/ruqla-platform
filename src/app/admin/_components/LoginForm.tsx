'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { loginAction, type LoginState } from '../login/actions';

const initialState: LoginState = {};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '';
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <Card className="border-2 border-border bg-card shadow-lg ring-1 ring-border/50">
      <CardHeader>
        <CardTitle className="font-sans">Credenciales</CardTitle>
        <CardDescription className="font-body">
          Usá el usuario administrador configurado en Supabase Auth.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {next ? <input type="hidden" name="next" value={next} /> : null}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="admin@ruqla.com"
              required
              disabled={isPending}
              className="py-5"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Contraseña
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              disabled={isPending}
              className="py-5"
            />
          </div>

          {state.error && (
            <p className="text-sm font-body font-bold text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full py-5 font-bold" disabled={isPending}>
            {isPending ? 'Ingresando…' : 'Ingresar al panel'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
