import { t } from "../trpc";
import { z } from "zod";

export const taxRouter = t.router({
  remove: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    return await ctx.prisma.tax.update({
      where: {
        tax_id: input,
      },
      data: {
        deleted: true,
      },
    });
  }),
  add: t.procedure
    .input(
      z.object({
        name: z.string(),
        percent: z.number(),
        company_id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.tax.create({ data: input });
    }),
  getTax: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
    return await ctx.prisma.tax.findMany({
      where: {
        company_id: input,
        deleted: false,
      },
      select: {
        name: true,
        percent: true,
        tax_id: true,
      },
    });
  }),
});
