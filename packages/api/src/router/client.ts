import { t } from "../trpc";
import { z } from "zod";

interface IAddress {
  city: string;
  address_id: string;
  address: string;
  is_billing: boolean;
}

interface IJob {
  address: string;
  job_note: string | null;
  job_id: string;
  job_number: number;
}

export const clientRouter = t.router({
  all: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    return await ctx.prisma.client.findMany({
      where: {
        company_id: input,
      },
      select: {
        client_id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        address: {
          where: { deleted: { equals: false } },
          select: {
            address: true,
            address_id: true,
          },
        },
      },
    });
  }),
  byId: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    const clientData = await ctx.prisma.client.findUniqueOrThrow({
      where: { client_id: input },
      select: {
        client_id: true,
        first_name: true,
        last_name: true,
        platform: true,
        email: true,
        fax: true,
        phone_number: true,
        mobile_number: true,
        term: true,
        note: true,
        address: {
          select: {
            address_id: true,
            address: true,
            deleted: true,
            is_billing: true,
            city: true,
            job_details: {
              select: {
                job_id: true,
                job_number: true,
                job_note: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const { address, ...clientInfo } = clientData;

    const { addr, jobs } = address.reduce(
      (acc, cur) => {
        const { job_details, ...address } = cur;
        acc.addr.push(address);
        if (!!job_details.length) {
          acc.jobs.push(
            job_details.map((j) => ({ ...j, address: cur.address }))
          );
        }
        return acc;
      },
      { addr: [] as IAddress[], jobs: [] as IJob[][] }
    );

    return {
      clientInfo: {
        ...clientInfo,
        platform: { label: clientInfo.platform, value: clientInfo.platform },
      },
      address: addr,
      jobs: jobs.flat(),
    };
  }),
  create: t.procedure
    .input(
      z.object({
        company_id: z.string(),
        first_name: z.string(),
        last_name: z.string(),
        phone_number: z.string().nullable(),
        mobile_number: z.string().nullable(),
        fax: z.string().nullable(),
        email: z.string(),
        address: z.string(),
        city: z.string(),
        platform: z.string(),
        term: z.string(),
        note: z.string(),
        billingaddress: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.client.create({
        data: {
          company_id: input.company_id,
          first_name: input.first_name,
          last_name: input.last_name,
          phone_number: input.phone_number,
          mobile_number: input.mobile_number,
          fax: input.fax,
          email: input.email,
          term: input.term,
          note: input.note,
          platform: input.platform as any,
          address: {
            create: {
              address: input.address,
              city: input.city,
              province: "Saskatchewan",
              country: "Canada",
              is_billing: input.billingaddress,
            },
          },
        },
      });
    }),
  update: t.procedure
    .input(
      z.object({
        client_id: z.string(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        phone_number: z.string().nullish(),
        mobile_number: z.string().nullish(),
        fax: z.string().nullish(),
        email: z.string().optional(),
        platform: z.enum(["FACEBOOK", "EMAIL", "TEXT", "PHONE"]).optional(),
        term: z.string().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { client_id, ...remaining } = input;
      return await ctx.prisma.client
        .update({
          where: { client_id: client_id },
          data: {
            ...remaining,
          },
        })
        .catch((e) => {
          console.error(e);
        });
    }),
});
