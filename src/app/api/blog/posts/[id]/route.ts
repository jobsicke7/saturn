import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Post from '@/models/Post';
import connectDB from '@/lib/mongodb';

// The context type needs to be adjusted
interface Params {
    params: {
        id: string;
    }
}

export async function GET(
    req: NextRequest,
    context: Params
) {
    try {
        await connectDB();

        const { id } = context.params;
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
    req: NextRequest,
    context: Params
) {
    try {
        const session = await getServerSession();

        await connectDB();
        
        const { id } = context.params;
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

        const { title, content, mainImage } = await req.json();

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
    req: NextRequest,
    context: Params
) {
    try {
        const session = await getServerSession();

        await connectDB();
        
        const { id } = context.params;
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
