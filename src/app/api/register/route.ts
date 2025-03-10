import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { clientPromise } from '@/lib/mongodb';
import type { RegistrationData } from '@/types/register';

export async function POST(req: Request) {
    try {
        const formData = await req.json();
        const { email, password, name, image, birthDate } = formData;

        const client = await clientPromise;
        const db = client.db();

        // 이메일 인증 확인
        const tempUser = await db.collection('tempUsers').findOne({
            email,
            isEmailVerified: true
        });

        if (!tempUser) {
            return NextResponse.json(
                { error: '이메일 인증이 필요합니다' },
                { status: 400 }
            );
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 12);

        // 새 사용자 생성
        const result = await db.collection('users').insertOne({
            email,
            password: hashedPassword,
            name,
            image,
            birthDate,
            createdAt: new Date(),
        });

        // 임시 사용자 데이터 삭제
        await db.collection('tempUsers').deleteOne({ email });

        return NextResponse.json(
            { message: '회원가입이 완료되었습니다', userId: result.insertedId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
