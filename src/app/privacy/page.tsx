// app/privacy/page.tsx
import { Metadata } from 'next';
import clientPromise from '@/lib/mongodb';
import DocViewer from '@/components/DocViewer';

export const metadata: Metadata = {
    title: '개인정보처리방침',
    description: '웹사이트의 개인정보처리방침입니다.',
};

async function getPrivacyContent() {
    try {
        const client = await clientPromise;
        const db = client.db();

        const document = await db.collection('documents').findOne({ type: 'privacy' });
        return document?.content || '';
    } catch (error) {
        console.error('Failed to fetch privacy document:', error);
        return '';
    }
}

export default async function PrivacyPage() {
    const content = await getPrivacyContent();

    return (
        <main>
            <DocViewer content={content} title="개인정보처리방침" />
        </main>
    );
}
