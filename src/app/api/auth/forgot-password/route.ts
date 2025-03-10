import { NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb'; // 중괄호로 named import 사용
import { sendVerificationEmail } from '@/lib/resetpw';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        
        // MongoDB 클라이언트를 올바르게 사용
        const mongoClient = await clientPromise;
        const db = mongoClient.db();

        // 나머지 코드는 동일
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return NextResponse.json(
                { error: '입력하신 이메일로 가입된 계정이 없어요' },
                { status: 404 }
            );
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1시간 유효

        await db.collection('users').updateOne(
            { email },
            { $set: { resetToken, resetTokenExpiry } }
        );

        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

        await sendVerificationEmail(email, resetUrl);

        return NextResponse.json({ message: '이메일이 전송되었습니다.' });
    } catch (error) {
        console.error('Error in forgot-password:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
