import mongoose from 'mongoose';

// MongoDB 연결 상태를 캐시하는 변수
let isConnected = false;

export const connectToDatabase = async () => {
  // 이미 연결된 경우 함수 종료
  if (isConnected) {
    return;
  }

  // MongoDB URI 확인
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  try {
    // mongoose 옵션 설정
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
};
