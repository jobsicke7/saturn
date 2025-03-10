import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import NaverProvider from 'next-auth/providers/naver';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID!,
            clientSecret: process.env.NAVER_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const client = await clientPromise;
                const db = client.db();
                const user = await db.collection('users').findOne({ email: credentials.email });

                if (!user) {
                    throw new Error('User not found');
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                // MongoDB의 _id를 문자열로 변환
                const userId = user._id.toString();

                // 세션에 저장될 사용자 정보 반환
                return {
                    id: userId,
                    email: user.email,
                    name: user.name,
                    // 추가하고 싶은 다른 사용자 정보
                };
            }
        }),
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                // 추가하고 싶은 다른 사용자 정보
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session?.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                // 추가하고 싶은 다른 사용자 정보
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        newUser: '/register',
    },
    session: {
        strategy: 'jwt',
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };