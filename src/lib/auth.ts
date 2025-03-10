import { getServerSession } from 'next-auth/next';
import connectDB from './mongodb';
import Admin from '../models/Admin';

// 관리자 여부 확인 함수
export async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  
  // jobsicke282@gmail.com은 항상 관리자로 처리
  if (email === 'jobsicke282@gmail.com') return true;
  
  try {
    await connectDB();
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    return !!admin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// 현재 세션의 사용자가 관리자인지 확인
export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await getServerSession();
  return isAdmin(session?.user?.email);
}
