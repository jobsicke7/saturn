import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type Params = {
  params: {
    id: string;
  };
};

// GET 요청 처리 핸들러
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { db } = await connectToDatabase();
    const id = params.id;

    // ObjectId 형식이 아닌 경우 404 반환
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 404 });
    }

    const post = await db.collection('posts').findOne({ _id: new ObjectId(id) });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT 요청 처리 핸들러
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { db } = await connectToDatabase();
    const id = params.id;
    const data = await request.json();

    // ObjectId 형식이 아닌 경우 400 반환
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const result = await db.collection('posts').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updatedPost = await db.collection('posts').findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ post: updatedPost }, { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE 요청 처리 핸들러
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { db } = await connectToDatabase();
    const id = params.id;

    // ObjectId 형식이 아닌 경우 400 반환
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const result = await db.collection('posts').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
