import { t } from "../trpc";
import { z } from "zod";
import cuid from "cuid";
import { TRPCError } from "@trpc/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const invoiceTemplateRouter = t.router({
  getInvoice: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    const invoice = await ctx.prisma.$transaction(async () => {
      const company = await ctx.prisma.company.findFirst({
        where: { id: input },
        select: {
          company_name: true,
        },
      });

      const invoice = await ctx.prisma.invoice_template.findFirst({
        where: { company_id: input },
        select: {
          invoice_template_id: true,
          address: true,
          city: true,
          email: true,
          footer: true,
          gst: true,
          pst: true,
          link: true,
          logo: true,
          phone: true,
          terms: true,
          due_date: true,
          final_notice: true,
        },
      });

      return { ...invoice, company_name: company?.company_name };
    });

    return {
      ...invoice,
      logo: String(process.env.CLOUDFLARE_PUBLIC) + invoice.logo,
    };
  }),
  createUpdateInvoiceTemplate: t.procedure
    .input(
      z.object({
        invoice_template_id: z.string(),
        company_id: z.string(),
        gst: z.string().optional(),
        pst: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        link: z.string().optional(),
        footer: z.string().optional(),
        terms: z.string().optional(),
        due_date: z.number().optional(),
        final_notice: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.invoice_template.upsert({
        where: {
          invoice_template_id: input.invoice_template_id ?? "",
        },
        create: {
          ...input,
          invoice_template_id: cuid(),
        },
        update: { ...input },
      });
    }),
  getLogoSignedUrl: t.procedure
    .input(z.object({ company_id: z.string(), logo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const signedUrl = await getSignedUrl(
        ctx.s3,
        new PutObjectCommand({
          Bucket: "public-enlive-manager",
          Key: input.logo,
        }),
        { expiresIn: 3600 }
      );
      if (signedUrl) {
        return signedUrl;
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get Signed upload url.",
          cause: "Failed to get Signed upload url",
        });
      }
    }),
  updateInvoiceLogo: t.procedure
    .input(z.object({ company_id: z.string(), logoPath: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.invoice_template.update({
        where: {
          company_id: input.company_id,
        },
        data: { logo: input.logoPath },
      });
    }),
});
