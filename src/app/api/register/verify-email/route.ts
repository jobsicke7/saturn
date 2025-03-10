import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { clientPromise } from '@/lib/mongodb';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const client = await clientPromise;
        const db = client.db();

        // 이메일 중복 체크 (실제 users 컬렉션)
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: '이미 가입된 이메일입니다' },
                { status: 400 }
            );
        }

        // 6자리 랜덤 인증 코드 생성
        const verificationToken = crypto.randomInt(100000, 999999).toString();
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 30);

        // 임시 사용자 정보 저장 또는 업데이트
        await db.collection('tempUsers').updateOne(
            { email },
            {
                $set: {
                    email,
                    verificationToken,
                    verificationExpires: expirationTime,
                    isEmailVerified: false,
                    createdAt: new Date(),
                },
            },
            { upsert: true }
        );

        // 인증 이메일 발송
        await sendVerificationEmail(email, verificationToken);

        return NextResponse.json(
            { message: '인증 코드가 이메일로 전송되었습니다' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: '인증 코드 전송 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        const { email, verificationToken } = await req.json();

        const client = await clientPromise;
        const db = client.db();

        // 임시 사용자 찾기
        const tempUser = await db.collection('tempUsers').findOne({
            email,
            verificationToken,
            verificationExpires: { $gt: new Date() },
        });

        if (!tempUser) {
            return NextResponse.json(
                { error: '유효하지 않거나 만료된 인증 코드입니다' },
                { status: 400 }
            );
        }

        // 이메일 인증 완료 처리
        await db.collection('tempUsers').updateOne(
            { email },
            {
                $set: {
                    isEmailVerified: true,
                },
            }
        );

        return NextResponse.json(
            { message: '이메일 인증이 완료되었습니다' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: '이메일 인증 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
