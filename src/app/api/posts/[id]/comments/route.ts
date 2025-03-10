import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {clientPromise} from '@/lib/mongodb';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = await clientPromise;
    const collection = client.db('community').collection('comments');
    const comments = await collection
        .find({ postId: (await params).id })
        .sort({ createdAt: -1 })
        .toArray();
    return NextResponse.json(comments);
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { content } = await request.json();
    const client = await clientPromise;
    const collection = client.db('community').collection('comments');

    const comment = {
        postId: (await params).id,
        content,
        authorName: session.user?.name,
        createdAt: new Date()
    };

    await collection.insertOne(comment);
    return NextResponse.json(comment);
}