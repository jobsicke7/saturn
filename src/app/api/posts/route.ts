import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { clientPromise } from '../../../lib/mongodb'; // Use named import

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('community');
        const collection = db.collection('posts');
        
        const posts = await collection.find().sort({ createdAt: -1 }).toArray();
        return NextResponse.json(posts);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { title, content, authorName } = await request.json();

        const client = await clientPromise;
        const db = client.db('community');
        const collection = db.collection('posts');

        const post = {
            title,
            content,
            authorName,
            views: 0,
            createdAt: new Date(),
            authorEmail: session.user?.email
        };

        const result = await collection.insertOne(post);
        return NextResponse.json({ ...post, _id: result.insertedId });
    } catch (error) {
        console.error('Database error:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to create post' }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
