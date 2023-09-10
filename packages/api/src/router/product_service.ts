import { t } from "../trpc";
import { z } from "zod";

export const productServiceRouter = t.router({
  add: t.procedure
    .input(
      z.object({
        company_id: z.string(),
        tax: z.array(z.string()),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tax = input.tax.map((i) => ({ tax_id: i }));
      return await ctx.prisma.product_service.create({
        data: {
          name: input.name,
          company_id: input.company_id,
          product_service_tax: {
            createMany: { data: tax },
          },
        },
      });
    }),
  getProductService: t.procedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.product_service.findMany({
        where: { company_id: input, deleted: false },
        select: {
          product_service_id: true,
          name: true,
          product_service_tax: {
            select: {
              tax: true,
            },
          },
        },
      });
    }),
  remove: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    return await ctx.prisma.product_service.update({
      where: {
        product_service_id: input,
      },
      data: { deleted: true },
    });
  }),
});
