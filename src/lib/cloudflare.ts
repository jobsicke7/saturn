import { S3Client } from '@aws-sdk/client-s3';

// Cloudflare R2 클라이언트 생성 함수
export function createR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    },
  });
}

// R2 공개 URL 생성 함수
export function getR2PublicUrl(objectKey: string): string {
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${objectKey}`;
}
