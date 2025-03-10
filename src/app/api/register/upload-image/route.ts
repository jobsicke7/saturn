import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: '이미지 파일이 필요합니다' },
                { status: 400 }
            );
        }

        // 파일 확장자 확인
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: '지원하지 않는 파일 형식입니다' },
                { status: 400 }
            );
        }

        // 파일 크기 제한 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: '파일 크기는 5MB를 초과할 수 없습니다' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 고유한 파일명 생성
        const uniqueId = crypto.randomBytes(16).toString('hex');
        const extension = path.extname(file.name);
        const fileName = `${uniqueId}${extension}`;

        // public/uploads 디렉토리에 파일 저장
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await writeFile(path.join(uploadDir, fileName), buffer);

        // 이미지 URL 반환
        const imageUrl = `/uploads/${fileName}`;

        return NextResponse.json(
            { imageUrl },
            { status: 200 }
        );
    } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json(
            { error: '이미지 업로드 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
