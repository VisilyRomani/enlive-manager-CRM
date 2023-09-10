import { TRPCError } from "@trpc/server";
import { t } from "../trpc";

const isAuthed = t.middleware(async (opts) => {
  const { ctx } = opts;

  const perms = await ctx.prisma.session.findUnique({
    where: { sessionToken: ctx.session },
    select: {
      user: {
        select: {
          user_role: true,
        },
      },
    },
  });

  if (!["OWNER", "ADMIN", "OPERATIONS"].includes(perms?.user.user_role ?? "")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx,
  });
});

const isOwner = t.middleware(async (opts) => {
  const { ctx } = opts;

  const perms = await ctx.prisma.session.findUnique({
    where: { sessionToken: ctx.session },
    select: {
      user: {
        select: {
          user_role: true,
        },
      },
    },
  });

  if (!("OWNER" === (perms?.user.user_role ?? ""))) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx,
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const ownerProcedure = t.procedure.use(isOwner);
