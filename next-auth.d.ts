import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            // 추가하고 싶은 다른 사용자 정보
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        email: string;
        name: string;
        // 추가하고 싶은 다른 사용자 정보
    }
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
            birthDate?: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        email: string;
        name: string;
        image?: string;
        birthDate?: string;
    }
}