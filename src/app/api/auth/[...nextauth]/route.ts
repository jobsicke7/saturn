// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import NaverProvider from 'next-auth/providers/naver';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { clientPromise } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// authOptions를 export로 변경하여 다른 파일에서 사용할 수 있게 합니다
export const authOptions: NextAuthOptions = {
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

        await connectDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
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

// NextAuth 핸들러를 생성하고 이를 내보냅니다
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
