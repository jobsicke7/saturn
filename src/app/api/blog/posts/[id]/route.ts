import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Post from '@/models/Post';
import connectDB from '@/lib/mongodb';

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        await connectDB();
        
        // params를 직접 사용하지 않고 context에서 안전하게 추출
        const { id } = await context.params;
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
    context: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        await connectDB();
        
        const { id } = await context.params;
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
    context: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        await connectDB();
        
        const { id } = await context.params;
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
