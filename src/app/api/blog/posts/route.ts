import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    
    let filter = {};
    if (query) {
      filter = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
        ],
      };
    }
    
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 }) // 최신순
      .limit(50);
    
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 관리자 확인
    const adminStatus = await isAdmin(session.user.email);
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can create posts.' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { title, content, mainImage, author } = await req.json();
    
    const newPost = new Post({
      title,
      content,
      mainImage,
      author,
    });
    
    await newPost.save();
    
    return NextResponse.json(
      { message: 'Post created successfully', post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
