import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/components/admin/Dashboard';

export default async function AdminPage() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
}
