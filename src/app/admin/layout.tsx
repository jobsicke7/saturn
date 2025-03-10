import { ReactNode } from 'react';
import { getAdminSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing the application',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  return (
    <div>
      {children}
    </div>
  );
}
