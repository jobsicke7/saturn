import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import AdminLayout from '@/components/admin/AdminLayout';
import PermissionsList from '@/components/admin/PermissionsList';

export default async function PermissionsPage() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  return (
    <AdminLayout>
      <PermissionsList />
    </AdminLayout>
  );
}
