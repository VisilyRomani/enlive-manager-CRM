import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    expires: Date;
    user: {
      company_id: string;
      id: string;
      user_role: string;
    } & DefaultSession["user"];
  }
}
