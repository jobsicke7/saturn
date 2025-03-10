// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// R2 클라이언트 설정
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://48e200960d616dcbafc2508f31dd0cc7.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'aebeb19f179e432e5ec66ba9a04433e0',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'f6792be02c6f05f4a4d181206c23cfa14c84604618da183382ee6d1f84dfdd2b'
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'your-bucket-name';
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || null;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // 파일 버퍼 생성
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 고유 파일명 생성
    const randomFileName = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const key = `uploads/${randomFileName}.${fileExtension}`;
    
    // R2에 업로드
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    };
    
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // 파일 URL 생성
    let fileUrl;
    if (PUBLIC_URL) {
      fileUrl = `${PUBLIC_URL}/${key}`;
    } else {
      // 기본 R2 URL 또는 커스텀 도메인
      fileUrl = `https://${BUCKET_NAME}.r2.dev/${key}`;
    }
    
    return NextResponse.json({ 
      url: fileUrl,
      success: true 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const filename = url.searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }
    
    const key = `uploads/${filename}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };
    
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    
    return NextResponse.json({ 
      success: true,
      message: `Deleted file: ${filename}`
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: `Error deleting file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
