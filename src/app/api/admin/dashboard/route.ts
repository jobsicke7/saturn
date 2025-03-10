import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    // 관리자 세션 검증
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // 전체 사용자 수 조회
    const totalUsers = await User.countDocuments();
    
    // 오늘 가입한 사용자 수 조회
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });
    
    // 활성 사용자 수 (최근 30일 내 가입 또는 이메일 인증된 사용자)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.countDocuments({
      $or: [
        { createdAt: { $gte: thirtyDaysAgo } },
        { isEmailVerified: true }
      ]
    });
    
    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        newUsersToday,
        activeUsers,
        // 필요에 따라 더 많은 통계 데이터 추가
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
