import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Post from '@/models/Post';
import connectDB from '@/lib/mongodb';

// Next.js 15 호환 타입 정의
export interface PostParams {
  id: string;
}

export async function GET(
  request: NextRequest,
  context: { params: PostParams }
) {
  try {
    await connectDB();
    
    // 올바른 방식으로 id 추출
    const id = context.params.id;
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: PostParams }
) {
  try {
    const session = await getServerSession();
    await connectDB();
    
    const id = context.params.id;
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to edit
    if (session?.user?.email !== post.author.email) {
      return NextResponse.json(
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

    return NextResponse.json(
      { message: 'Post updated successfully', post },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: PostParams }
) {
  try {
    const session = await getServerSession();
    await connectDB();
    
    const id = context.params.id;
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to delete
    if (session?.user?.email !== post.author.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
