import { t } from "../trpc";
import { z } from "zod";
// import bcrypt from "bcrypt";

export const userRouter = t.router({
  getUser: t.procedure
    .input(z.object({ email: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findFirstOrThrow({
        where: { email: input.email },
        select: {
          id: true,
          company_id: true,
          email: true,
          name: true,
        },
      });
    }),
  getUserByGoogle: t.procedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const fetchData = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${input}`,
            Accept: "application/json",
          },
        }
      ).then(async (response) => await response.json());

      const data = await ctx.prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "google",
            providerAccountId: (fetchData?.id as string) ?? "",
          },
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              user_role: true,
              company_id: true,
            },
          },
        },
      });
      return data;
    }),
  allUsers: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.prisma.user.findMany({
      where: {
        company_id: input,
      },
      orderBy: {
        user_role: "asc",
      },
      select: {
        id: true,
        name: true,
        active: true,
        email: true,
        image: true,
        user_role: true,
      },
    });
  }),
  allScheduleUsers: t.procedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          company_id: input,
          active: true,
        },
        select: {
          id: true,
          name: true,
        },
      });
    }),
  updateUser: t.procedure
    .input(
      z.object({
        id: z.string(),
        user_role: z
          .enum(["OWNER", "ADMIN", "OPERATIONS", "TEAMLEAD", "WORKER"])
          .optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...update } = input;
      return ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          ...update,
        },
      });
    }),
});
