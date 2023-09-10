import { t } from "../trpc";
import { z } from "zod";
import { jobRouter } from "./job";

export const scheudleRouter = t.router({
  getScheduleByDay: t.procedure
    .input(
      z.object({
        company_id: z.string(),
        date: z.string(),
        user_id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const scheduleData = await ctx.prisma.schedule.findMany({
        where: {
          company_id: input.company_id,
          user_schedule: { some: { user_id: input.user_id } },
          date: new Date(input.date),
          job_details: {
            some: {
              status: { not: "COMPLETED" },
            },
          },
        },
        select: {
          schedule_id: true,
          schedule_name: true,
          _count: { select: { job_details: true } },
          user_schedule: {
            select: {
              user: true,
            },
          },
        },
      });
      return scheduleData.map((schedule) => {
        return {
          ...schedule,
          job_details: schedule._count.job_details,
        };
      });
    }),
  getNextJob: t.procedure
    .input(
      z.object({
        schedule_id: z.string(),
        completed_job_id: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async () => {
        if (input.completed_job_id) {
          await ctx.prisma.job_details.update({
            where: { job_id: input.completed_job_id },
            data: {
              end_time: new Date(),
              status: "COMPLETED",
              updated_at: new Date(),
            },
          });
        }

        const fistJob = await ctx.prisma.schedule.findFirst({
          where: {
            schedule_id: input.schedule_id,
          },
          select: {
            job_details: {
              where: {
                status: { notIn: ["COMPLETED", "CANCELED", "POSTPONED"] },
              },
              orderBy: {
                estimated_end_time: "asc",
              },
              select: {
                job_id: true,
              },
            },
          },
        });

        if (fistJob?.job_details.length) {
          const updatedData = await ctx.prisma.job_details.update({
            where: {
              job_id: fistJob.job_details.at(0)?.job_id,
            },
            data: {
              status: "IN_PROGRESS",
              updated_at: new Date(),
              start_time: new Date(),
            },
            select: {
              job_id: true,
              job_note: true,
              status: true,
              estimated_start_time: true,
              estimated_end_time: true,
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
                  city: true,
                  address: true,
                  client: { select: { first_name: true, last_name: true } },
                },
              },
            },
          });
          return updatedData;
        }
        return "COMPLETED";
      });
    }),
  getScheduleByMonth: t.procedure
    .input(z.object({ start: z.date(), end: z.date(), company_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { start, end } = input;

      return (
        await ctx.prisma.schedule.findMany({
          where: {
            date: { gte: start, lte: end },
            company_id: input.company_id,
          },
          select: {
            schedule_name: true,
            user_schedule: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            job_details: {
              select: {
                job_number: true,
                status: true,
              },
            },
            date: true,
            schedule_id: true,
          },
        })
      ).map((s) => ({
        ...s,
        completed: !s.job_details.filter(
          (f) => !["COMPLETED", "CANCELED"].includes(f.status)
        ).length,
      }));
    }),
  create: t.procedure
    .input(
      z.object({
        company_id: z.string(),
        scheduleDate: z.date(),
        schedule_name: z.string(),
        workers: z.array(z.string()),
        job_details: z.array(
          z.object({
            job_id: z.string(),
            estimated_start_time: z.date(),
            estimated_end_time: z.date(),
            estimated_time: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createSchedule = ctx.prisma.schedule.create({
        data: {
          date: input.scheduleDate,
          company_id: input.company_id,
          schedule_name: input.schedule_name,
          job_details: {
            connect: [
              ...input.job_details.map((j) => {
                return { job_id: j.job_id };
              }),
            ],
          },
          user_schedule: {
            createMany: {
              data: [
                ...input.workers.map((w) => {
                  return { user_id: w };
                }),
              ],
            },
          },
        },
      });

      const updateJobs = input.job_details.map((job) => {
        return ctx.prisma.job_details.update({
          where: {
            job_id: job.job_id,
          },
          data: {
            estimated_start_time: job.estimated_start_time,
            estimated_end_time: job.estimated_end_time,
            estimated_time: job.estimated_time,
            status: "CONFIRMED",
          },
        });
      });
      return await ctx.prisma.$transaction([createSchedule, ...updateJobs]);
    }),
  getScheduleById: t.procedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const scheudleData = await ctx.prisma.schedule.findUnique({
        where: {
          schedule_id: input,
        },
        select: {
          date: true,
          job_details: true,
          schedule_name: true,
          user_schedule: {
            select: {
              user: true,
            },
          },
        },
      });

      return scheudleData;
    }),
  updateSchedule: t.procedure
    .input(
      z.object({
        schedule_id: z.string(),
        removeJob: z.array(z.string()),
        addJob: z.array(
          z.object({
            job_id: z.string(),
            job_number: z.number(),
            status: z.string(),
            estimated_start_time: z.date(),
            estimated_end_time: z.date(),
            estimated_time: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { addJob, removeJob, schedule_id } = input;
      return await ctx.prisma.$transaction([
        ctx.prisma.job_details.updateMany({
          where: {
            job_id: { in: removeJob },
          },
          data: {
            scheduleSchedule_id: null,
            estimated_end_time: null,
            estimated_start_time: null,
            start_time: null,
            end_time: null,
            status: "POSTPONED",
          },
        }),
        ...addJob.map((a) => {
          return ctx.prisma.job_details.update({
            where: {
              job_id: a.job_id,
            },
            data: {
              job_number: a.job_number,
              estimated_start_time: a.estimated_start_time,
              estimated_end_time: a.estimated_end_time,
              estimated_time: a.estimated_time,
              scheduleSchedule_id: schedule_id,
              status: a.status != "COMPLETED" ? "CONFIRMED" : a.status,
            },
          });
        }),
      ]);
    }),
  updateDate: t.procedure
    .input(
      z.object({
        scheduleId: z.string(),
        scheduleDate: z.date(),
        data: z.array(
          z.object({
            job_id: z.string(),
            estimated_start_time: z.date(),
            estimated_end_time: z.date(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction([
        ctx.prisma.schedule.update({
          where: { schedule_id: input.scheduleId },
          data: {
            date: input.scheduleDate,
          },
        }),
        ...input.data.map((job) => {
          return ctx.prisma.job_details.update({
            where: { job_id: job.job_id },
            data: {
              estimated_start_time: new Date(
                input.scheduleDate.setHours(
                  job.estimated_start_time.getHours(),
                  job.estimated_start_time.getMinutes()
                )
              ),
              estimated_end_time: new Date(
                input.scheduleDate.setHours(
                  job.estimated_end_time.getHours(),
                  job.estimated_end_time.getMinutes()
                )
              ),
            },
          });
        }),
      ]);
    }),
});
