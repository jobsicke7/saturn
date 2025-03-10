import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth/next';
import { isAdmin } from '@/lib/auth';

// Cloudflare R2 클라이언트 설정
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 관리자 확인 또는 특정 권한 체크
    const adminStatus = await isAdmin(session.user.email);
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // 이미지 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }
    
    // 파일 확장자 추출
    const fileExtension = file.name.split('.').pop();
    
    // 고유한 파일 이름 생성
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    
    // 파일 데이터 가져오기
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // R2에 업로드
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || '';
    
    const putObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: `blog-images/${fileName}`,
      Body: buffer,
      ContentType: file.type,
    });
    
    await s3Client.send(putObjectCommand);
    
    const fileUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/blog-images/${fileName}`;
    
    return NextResponse.json(
      { url: fileUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
