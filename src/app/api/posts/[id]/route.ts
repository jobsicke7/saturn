import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import {clientPromise} from '@/lib/mongodb';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = await clientPromise;
    const collection = client.db('community').collection('posts');

    await collection.updateOne(
        { _id: new ObjectId((await params).id) },
        { $inc: { views: 1 } }
    );

    const post = await collection.findOne({ _id: new ObjectId((await params).id) });
    return NextResponse.json(post);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const collection = client.db('community').collection('posts');

    const post = await collection.findOne({ _id: new ObjectId((await params).id) });
    if (!post || post.authorEmail !== session.user?.email) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const { title, content } = await request.json();
    await collection.updateOne(
        { _id: new ObjectId((await params).id) },
        { $set: { title, content, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const collection = client.db('community').collection('posts');

    const post = await collection.findOne({ _id: new ObjectId((await params).id) });
    if (session.user?.email === 'kr.nextnova@gmail.com' || (post && post.authorEmail === session.user?.email)) {
        await collection.deleteOne({ _id: new ObjectId((await params).id) });
        return NextResponse.json({ success: true });
    }

    return new NextResponse('Forbidden', { status: 403 });
}