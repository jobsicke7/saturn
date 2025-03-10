import mongoose from 'mongoose';

// Mongoose 모델 인터페이스 정의
export interface IAdmin {
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// 스키마가 이미 정의되어 있는지 확인
const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

// 모델이 이미 존재하는 경우 그것을 사용하고, 그렇지 않으면 새로 생성
const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
