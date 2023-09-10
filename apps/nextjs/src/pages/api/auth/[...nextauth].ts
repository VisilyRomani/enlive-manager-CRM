/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { Session } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@acme/db";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  pages: {
    // signOut: "/auth/signout",
    newUser: "/admin/company",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    session({
      session,
      user,
    }: {
      session: any;
      user: any;
      token: any;
    }): Session {
      return {
        user,
        expires: session.expires,
      };
    },
  },
  secret: String(process.env.NEXTAUTH_SECRET),
};

export default NextAuth(authOptions);
