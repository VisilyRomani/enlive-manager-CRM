import { t } from "../trpc";
import { z } from "zod";
import { IntToDisplayPrice } from "../utils/utils";

export const jobRouter = t.router({
  all: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    const jobs = await ctx.prisma.job_details.findMany({
      where: {
        company_id: input,
      },
      select: {
        job_id: true,
        job_number: true,
        status: true,
        address: {
          select: {
            address: true,
            client: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });
    return jobs.map((job) => {
      const { address, ...filtjob } = job;
      return {
        ...filtjob,
        address: job.address.address,
        name:
          job.address.client.first_name + " " + job.address.client.last_name,
      };
    });
  }),
  byId: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    const data = await ctx.prisma.job_details.findUniqueOrThrow({
      where: { job_id: input },
      select: {
        creation_date: true,
        status: true,
        job_number: true,
        job_note: true,
        job_task: {
          select: {
            job_task_id: true,
            quantity: true,
            product_service_id: true,
            product_service: {
              select: {
                name: true,
              },
            },
            price: true,
          },
        },
        address: {
          select: {
            client: {
              select: {
                client_id: true,
                first_name: true,
                last_name: true,
              },
            },
            address: true,
          },
        },
      },
    });

    const { job_task, address, ...job } = data;
    return {
      job_task: job_task.map((jt) => {
        return {
          product_service_id: jt.product_service_id,
          job_name: jt.product_service.name,
          job_task_id: jt.job_task_id,
          price: IntToDisplayPrice(jt.price),
          quantity: String(jt.quantity),
        };
      }),
      job,
      client: { address: address.address, ...address.client },
    };
  }),
  edit: t.procedure
    .input(
      z.object({
        id: z.string(),
        job_note: z.string(),
        status: z.enum([
          "PENDING",
          "CONFIRMED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELED",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.job_details.update({
        where: { job_id: input.id },
        data: {
          status: input.status,
          job_note: input.job_note,
        },
      });
    }),
  create: t.procedure
    .input(
      z.object({
        company_id: z.string(),
        address_id: z.string(),
        job_note: z.string(),
        estimated_time: z.number(),
        list_task: z.array(
          z.object({
            price: z.number(),
            product_service_id: z.string(),
            quantity: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { list_task, ...job } = input;
      return ctx.prisma.$transaction(async () => {
        const job_number = await ctx.prisma.company.update({
          where: {
            id: input.company_id,
          },
          data: { company_job_count: { increment: 1 } },
          select: { company_job_count: true },
        });
        return await ctx.prisma.job_details.create({
          data: {
            ...job,
            job_number: job_number.company_job_count,
            job_task: {
              createMany: {
                data: list_task,
              },
            },
          },
        });
      });
    }),
  availableJobs: t.procedure
    .input(
      z.object({ company_id: z.string(), schedule_id: z.string().optional() })
    )
    .query(async ({ ctx, input }) => {
      const jobData = await ctx.prisma.job_details.findMany({
        where: {
          OR: [
            { scheduleSchedule_id: input.schedule_id },
            {
              status: { in: ["PENDING", "CONFIRMED", "POSTPONED"] },
              schedule: null,
              company_id: input.company_id,
            },
          ],
        },
        select: {
          job_id: true,
          address: {
            select: {
              address: true,
              client: {
                select: {
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
          job_task: {
            select: {
              product_service: {
                select: {
                  name: true,
                },
              },
            },
          },
          job_number: true,
          status: true,
          estimated_start_time: true,
          estimated_end_time: true,
          estimated_time: true,
        },
      });

      return jobData.map((j) => {
        const {
          address: {
            address,
            client: { first_name, last_name },
          },
          job_task,
          ...job
        } = j;
        return {
          job_id: job.job_id,
          address,
          client_name: first_name + " " + last_name,
          job_task: job_task.map((jt) => jt.product_service.name),
          job_number: job.job_number,
          status: job.status,
          estimated_time: job.estimated_time,
          estimated_start_time: job.estimated_start_time,
          estimated_end_time: job.estimated_end_time,
        };
      });
    }),
  completedJobs: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    const data = await ctx.prisma.job_details.findMany({
      where: {
        company_id: input,
        status: "COMPLETED",
        end_time: { not: null },
        invoice: { none: {} },
      },
      select: {
        job_number: true,
        job_id: true,
        end_time: true,
        job_task: {
          select: {
            product_service: {
              select: {
                name: true,
              },
            },
          },
        },
        address: {
          select: {
            client: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            address: true,
          },
        },
      },
    });

    return data.map((d) => ({
      job_id: d.job_id,
      job_number: d.job_number,
      end_time: d.end_time,
      job_task: d.job_task.map((jt) => jt.product_service.name),
      address: d.address.address,
      email: d.address.client.email,
      name: d.address.client.first_name + " " + d.address.client.last_name,
    }));
  }),
});
