import { Suspense } from 'react';
import LoginForm from '../_components/LoginForm';

export const metadata = {
  title: 'Admin · Ingresar | RUQLA',
  description: 'Acceso al panel de administración RUQLA.',
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
            RUQLA · Admin
          </p>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-foreground">
            Iniciar sesión
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-2">
            Solo personal autorizado puede acceder al panel de pedidos.
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
