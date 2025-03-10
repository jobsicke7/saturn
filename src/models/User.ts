import mongoose from 'mongoose';

// Mongoose 모델 인터페이스 정의
export interface IUser {
  email: string;
  password?: string;
  name: string;
  image?: string;
  birthDate?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 스키마가 이미 정의되어 있는지 확인
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    image: {
      type: String,
    },
    birthDate: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 모델이 이미 존재하는 경우 그것을 사용하고, 그렇지 않으면 새로 생성
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
