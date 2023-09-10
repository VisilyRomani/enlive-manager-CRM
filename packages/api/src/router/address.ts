import { protectedProcedure } from "../middleware/auth";
import { t } from "../trpc";
import { z } from "zod";

export const addressRouter = t.router({
  delete: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    return await ctx.prisma.address.update({
      where: { address_id: input },
      data: { deleted: true },
    });
  }),
  add: t.procedure
    .input(
      z.object({
        address: z.string(),
        city: z.string(),
        province: z.string(),
        country: z.string(),
        client_id: z.string(),
        is_billing: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.address
        .create({
          data: {
            address: input.address,
            city: input.city,
            province: input.province,
            country: input.country,
            client_id: input.client_id,
            is_billing: input.is_billing,
          },
        })
        .catch((e) => {
          console.error(e);
        });
    }),
});
