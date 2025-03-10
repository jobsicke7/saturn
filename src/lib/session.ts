import { getServerSession } from 'next-auth/next';
import type { NextAuthOptions } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import Admin from '@/models/Admin';

// NextAuth 옵션을 외부에서 가져오는 대신 직접 정의
export const authOptions: NextAuthOptions = {
    // NextAuth 설정은 API 라우트에 있으므로 여기서는 생략
    session: {
        strategy: 'jwt',
    },
    providers: []
};

// 관리자 사용자인지 확인
export async function isAdminUser(email: string) {
  await connectToDatabase();
  
  // jobsicke282@gmail.com은 항상 관리자로 허용
  if (email === 'jobsicke282@gmail.com') {
    return true;
  }
  
  // MongoDB에서 관리자 확인
  const admin = await Admin.findOne({ email });
  return !!admin;
}

// 관리자 세션 가져오기
export async function getAdminSession() {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return null;
    }
    
    const isAdmin = await isAdminUser(session.user.email);
    
    if (!isAdmin) {
      return null;
    }
    
    return session;
  } catch (error) {
    console.error("Error getting admin session:", error);
    return null;
  }
}
