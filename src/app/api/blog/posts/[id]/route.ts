import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { isAdmin } from '@/lib/auth';

// Next.js 15의 라우트 핸들러 타입 정의
interface Params {
  id: string;
}

// GET 핸들러
export async function GET(
  request: NextRequest,
  context: { params: Params }
): Promise<Response> {
  try {
    await connectDB();
    
    const post = await Post.findById(context.params.id);
    
    if (!post) {
      return Response.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return Response.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT 핸들러
export async function PUT(
  request: NextRequest,
  context: { params: Params }
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const post = await Post.findById(context.params.id);
    
    if (!post) {
      return Response.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // 글 작성자이거나 관리자인 경우에만 수정 가능
    const adminStatus = await isAdmin(session.user.email);
    if (session.user.email !== post.author.email && !adminStatus) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { title, content, mainImage } = await request.json();
    
    post.title = title;
    post.content = content;
    post.mainImage = mainImage;
    post.updatedAt = new Date();
    
    await post.save();
    
    return Response.json(
      { message: 'Post updated successfully', post }
    );
  } catch (error) {
    console.error('Error updating post:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE 핸들러
export async function DELETE(
  request: NextRequest,
  context: { params: Params }
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const post = await Post.findById(context.params.id);
    
    if (!post) {
      return Response.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // 글 작성자이거나 관리자인 경우에만 삭제 가능
    const adminStatus = await isAdmin(session.user.email);
    if (session.user.email !== post.author.email && !adminStatus) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await Post.findByIdAndDelete(context.params.id);
    
    return Response.json(
      { message: 'Post deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
