export interface Post {
    _id: string;
    title: string;
    content: string;
    authorEmail: string;
    authorName: string;
    views: number;
    createdAt: string;
    updatedAt?: string;
}

export interface Comment {
    _id: string;
    postId: string;
    content: string;
    authorName: string;
    createdAt: Date;
}
