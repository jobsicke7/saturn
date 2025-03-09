import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// API 라우트를 항상 동적으로 실행
export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { type: string } }
) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const doc = await db.collection('docs').findOne({ type: params.type });

        if (!doc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // 캐시 헤더 설정
        return NextResponse.json(doc, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        console.error('Failed to fetch document:', error);
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}
