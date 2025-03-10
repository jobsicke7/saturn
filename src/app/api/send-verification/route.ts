import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const client = await clientPromise;
        const db = client.db();

        // tempUsers 컬렉션에서 해당 이메일의 인증 정보 조회
        const tempUser = await db.collection('tempUsers').findOne({
            email,
            verificationExpires: { $gt: new Date() }
        });

        if (!tempUser) {
            return NextResponse.json(
                { error: '인증 정보를 찾을 수 없거나 만료되었습니다' },
                { status: 400 }
            );
        }

        // 인증 메일 재발송
        await sendVerificationEmail(email, tempUser.verificationToken);

        return NextResponse.json(
            { message: '인증 코드가 재전송되었습니다' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Verification resend error:', error);
        return NextResponse.json(
            { error: '인증 코드 재전송 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
