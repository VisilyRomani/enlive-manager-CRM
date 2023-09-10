import { t } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
// import { s3 } from "../api/cloudflare";
import { CreateBucketCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3";

export const companyRouter = t.router({
  getCompany: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    return await ctx.prisma.company.findFirstOrThrow({
      where: { id: input },
      select: {
        company_name: true,
        email: true,
        number: true,
        address: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }),
  signUp: t.procedure
    .input(
      z.object({
        company_id: z.string(),
        isCreate: z.boolean(),
        user_id: z.string(),
        role: z.enum(["OWNER"]),
        company: z.object({
          company_name: z.string(),
          address: z.string(),
          email: z.string(),
          number: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async () => {
        const company = await ctx.prisma.company.upsert({
          where: {
            id: input.company_id,
          },
          create: {
            ...input.company,
            user: {
              connect: {
                id: input.user_id,
              },
            },
          },
          update: {
            ...input.company,
          },
        });

        if (input.isCreate) {
          await ctx.s3.send(new CreateBucketCommand({ Bucket: company.id }));
          await ctx.s3.send(
            new PutBucketCorsCommand({
              Bucket: company.id,
              CORSConfiguration: {
                CORSRules: [
                  {
                    // Allow all headers to be sent to this bucket.
                    AllowedHeaders: ["*"],
                    // Allow only GET and PUT methods to be sent to this bucket.
                    AllowedMethods: ["GET", "PUT"],
                    // Allow only requests from the specified origin.
                    AllowedOrigins: [
                      "http://localhost:3000",
                      "https://dev-radiant-admin.vercel.app/",
                      "https://radiant-admin.vercel.app/",
                    ],
                    // Allow the entity tag (ETag) header to be returned in the response. The ETag header
                    // The entity tag represents a specific version of the object. The ETag reflects
                    // changes only to the contents of an object, not its metadata.
                    ExposeHeaders: ["ETag"],
                    // How long the requesting browser should cache the preflight response. After
                    // this time, the preflight request will have to be made again.
                    MaxAgeSeconds: 3600,
                  },
                ],
              },
            })
          );
        }

        return await ctx.prisma.user.update({
          where: { id: input.user_id },
          data: {
            user_role: input.role,
          },
        });
      });
    }),
  connectCompany: t.procedure
    .input(z.object({ company_code: z.string(), user_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company_code.findFirst({
        where: {
          code: input.company_code,
        },
      });

      if (company?.company_id) {
        return await ctx.prisma.company.update({
          where: {
            id: company.company_id,
          },
          data: {
            user: {
              connect: {
                id: input.user_id,
              },
              update: {
                where: {
                  id: input.user_id,
                },
                data: {
                  user_role: "TEAMLEAD",
                },
              },
            },
            code: {
              delete: {
                code: input.company_code,
              },
            },
          },
        });
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "company code not found",
        });
      }
    }),
});
