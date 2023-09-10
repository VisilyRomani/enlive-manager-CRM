import { t } from "../trpc";
import { z } from "zod";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";

export const invoiceLocationRouter = t.router({
  getInvoicePDF: t.procedure
    .input(z.object({ invoice_id: z.string(), company_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const location = await ctx.prisma.invoice_location.findMany({
        where: { invoice_id: input.invoice_id },
        select: { invoice_key: true },
        orderBy: { created_at: "desc" },
        take: 1,
      });
      if (!location[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice PDF Not Found",
        });
      }
      return await getSignedUrl(
        ctx.s3,
        new GetObjectCommand({
          Bucket: input.company_id,
          Key: location[0].invoice_key,
        })
      );
    }),
});
