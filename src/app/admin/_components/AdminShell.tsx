'use client';

import { usePathname } from 'next/navigation';

import { Toaster } from '@/components/ui/sonner';

import AdminHeader from './AdminHeader';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <>
      <AdminHeader />
      {children}
      <Toaster />
    </>
  );
}
