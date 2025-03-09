// app/terms/page.tsx
import { Metadata } from 'next';
import clientPromise from '@/lib/mongodb';
import DocViewer from '@/components/DocViewer';

export const metadata: Metadata = {
    title: '이용약관',
    description: '웹사이트의 이용약관입니다.',
};

async function getTermsContent() {
    try {
        const client = await clientPromise;
        const db = client.db();

        const document = await db.collection('documents').findOne({ type: 'terms' });
        return document?.content || '';
    } catch (error) {
        console.error('Failed to fetch terms document:', error);
        return '';
    }
}

export default async function TermsPage() {
    const content = await getTermsContent();

    return (
        <main>
            <DocViewer content={content} title="이용약관" />
        </main>
    );
}
