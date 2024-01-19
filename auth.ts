import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {
  // 주어진 이메일로 사용자를 찾는 역할 -> 사용자가 없으면 undefined 반환
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      // Credentials는 NextAuth의 인증 공급자 중 하나로, 사용자 이름과 비밀번호를 이용한 직접 인증을 제공합니다. //! authorize 메소드는 사용자 이름과 비밀번호를 검증하는 로직을 가지고 있습니다
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials); // 이메일 형식과 비밀번호의 최소 길이를 검증하는 로직

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          // 비밀번호가 일치하면 사용자를 반환하고, 그렇지 않으면 null사용자가 로그인하지 못하도록 반환합니다.
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
