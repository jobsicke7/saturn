import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import AdminLayout from '@/components/admin/AdminLayout';
import UsersList from '@/components/admin/UsersList';

export default async function UsersPage() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  return (
    <AdminLayout>
      <UsersList />
    </AdminLayout>
  );
}
