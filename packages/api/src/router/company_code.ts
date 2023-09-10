import { t } from "../trpc";
import { z } from "zod";

export const codeRouter = t.router({
  createCode: t.procedure
    .input(z.object({ company_id: z.string(), code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.company_code.create({ data: { ...input } });
    }),
});
