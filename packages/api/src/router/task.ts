import { t } from "../trpc";
import { z } from "zod";

export const taskRouter = t.router({
  remove: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    return await ctx.prisma.job_task.delete({
      where: {
        job_task_id: input,
      },
    });
  }),
  add: t.procedure
    .input(
      z.object({
        job_id: z.string(),
        price: z.number(),
        product_service_id: z.string(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.job_task.create({ data: input });
    }),
});
