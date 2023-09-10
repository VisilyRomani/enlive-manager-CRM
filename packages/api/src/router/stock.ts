import { t } from "../trpc";
import { z } from "zod";

export const stockRouter = t.router({
  addUpdateItem: t.procedure
    .input(
      z.object({
        company_id: z.string(),
        stock_id: z.string(),
        name: z.string(),
        manufacturer: z.string(),
        order_link: z.string(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.item_stock.upsert({
        where: {
          stock_id: input.stock_id,
        },
        update: {
          company_id: input.company_id,
          name: input.name,
          manufacturer: input.manufacturer,
          order_link: input.order_link,
          quantity: input.quantity,
        },
        create: {
          company_id: input.company_id,
          name: input.name,
          manufacturer: input.manufacturer,
          order_link: input.order_link,
          quantity: input.quantity,
        },
      });
    }),
  deleteItem: t.procedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.item_stock.delete({ where: { stock_id: input } });
  }),
  getAllItems: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.prisma.item_stock.findMany({
      where: {
        company_id: input,
      },
    });
  }),
});
