// app/api/docs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// 문서 가져오기
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || (type !== 'privacy' && type !== 'terms')) {
        return NextResponse.json(
            { error: 'Invalid document type' },
            { status: 400 }
        );
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        const document = await db.collection('documents').findOne({ type });

        if (!document) {
            return NextResponse.json({ content: '' });
        }

        return NextResponse.json({ content: document.content });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch document' },
            { status: 500 }
        );
    }
}

// 문서 저장하기
export async function POST(request: NextRequest) {
    try {
        const { type, content, password } = await request.json();

        // 비밀번호 검증
        if (password !== 'jslove0619qq@@') {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            );
        }

        if (!type || (type !== 'privacy' && type !== 'terms')) {
            return NextResponse.json(
                { error: 'Invalid document type' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        await db.collection('documents').updateOne(
            { type },
            { $set: { content, updatedAt: new Date() } },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to save document' },
            { status: 500 }
        );
    }
}
