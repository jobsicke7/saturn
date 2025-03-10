import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Post from '@/models/Post';
import connectDB from '@/lib/mongodb';

// Next.js 15 문법에 맞게 수정
type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        await connectDB();
        
        // 비동기 context.params 대신 일반 params 사용
        const id = params.id;
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
    { params }: RouteParams
) {
    try {
        const session = await getServerSession();
        await connectDB();
        
        const id = params.id;
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
    { params }: RouteParams
) {
    try {
        const session = await getServerSession();
        await connectDB();
        
        const id = params.id;
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
