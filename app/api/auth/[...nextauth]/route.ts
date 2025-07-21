import NextAuth, { NextAuthOptions, Session, User} from "next-auth";
import type { JWT } from "next-auth/jwt";

import CredentialsProvider from "next-auth/providers/credentials";


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Faltan credenciales");
        }

        const mockUser = {
          id: "1",
          email: "mama@example.com",
          name: "Mom",
          password: "12345678",
        };

        if (
          credentials.email === mockUser.email &&
          credentials.password === mockUser.password
        ) {
          return {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
          };
        }

        return null; // NextAuth trata null como credenciales inválidas
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {

      if (user) token.id = user.id;
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & { id?: string };
    }) {

      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

// Exportar manejadores para Next.js 13 App Router (GET y POST)
export { handler as GET, handler as POST };
