// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// Cloudflare R2 클라이언트 초기화
const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://48e200960d616dcbafc2508f31dd0cc7.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'aebeb19f179e432e5ec66ba9a04433e0',
    secretAccessKey: 'f6792be02c6f05f4a4d181206c23cfa14c84604618da183382ee6d1f84dfdd2b'
  },
});

// 버킷 이름 - 환경변수에서 가져오거나 직접 설정할 수 있습니다
// 보안을 위해 환경 변수 사용을 권장합니다
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'your-bucket-name';

// 공개 URL (R2에서 설정한 경우)
const PUBLIC_URL = process.env.R2_PUBLIC_URL || null;

export async function POST(request: NextRequest) {
  try {
    // 멀티파트 폼 데이터 처리
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 파일 버퍼로 변환
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 파일 타입 추출
    const fileType = file.type;
    
    // 랜덤 파일 이름 생성
    const randomFileName = crypto.randomUUID();
    const fileExtension = file.name.split('.').pop();
    const key = `uploads/${randomFileName}.${fileExtension}`;

    // 업로드 명령 생성
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: fileType,
    };

    console.log('Uploading file to R2:', { bucket: BUCKET_NAME, key });

    // R2에 업로드
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // 파일 URL 생성
    let fileUrl;
    
    if (PUBLIC_URL) {
      // 공개 URL이 설정된 경우
      fileUrl = `${PUBLIC_URL}/${key}`;
    } else {
      // R2 Public Access가 활성화된 버킷의 기본 URL 형식
      // 참고: Cloudflare R2는 일반적으로 공개 접근을 위한 URL을 별도로 설정해야 합니다
      fileUrl = `https://${BUCKET_NAME}.r2.dev/${key}`;
    }

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: `Error uploading file: ${error.message}` },
      { status: 500 }
    );
  }
}

// 큰 파일을 처리하기 위해 bodyParser 비활성화
export const config = {
  api: {
    bodyParser: false,
  },
};