// src/server/router/context.ts
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { prisma, s3, mail } from "@acme/db";
import { getToken } from "next-auth/jwt";
/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type CreateContextOptions = {
  session: string;
};

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 */
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    ...opts,
    prisma,
    s3,
    mail,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (
  opts: trpcNext.CreateNextContextOptions
) => {
  const token = await getToken({
    req: opts.req,
    secret: String(process.env.NEXTAUTH_SECRET),
    raw: true,
  });

  return await createContextInner({ session: token });
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
