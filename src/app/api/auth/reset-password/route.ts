// api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json();
        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection('users').findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json(
                { error: '유효하지 않거나 만료된 토큰입니다.' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.collection('users').updateOne(
            { _id: user._id },
            {
                $set: { password: hashedPassword },
                $unset: { resetToken: "", resetTokenExpiry: "" }
            }
        );

        return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error) {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}