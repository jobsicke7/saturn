import mongoose from 'mongoose';

// Mongoose 모델 인터페이스 정의
export interface IPost {
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
  mainImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 스키마가 이미 정의되어 있는지 확인
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      name: {
        type: String,
        required: [true, 'Author name is required'],
      },
      email: {
        type: String,
        required: [true, 'Author email is required'],
      },
    },
    mainImage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// 모델이 이미 존재하는 경우 그것을 사용하고, 그렇지 않으면 새로 생성
const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
