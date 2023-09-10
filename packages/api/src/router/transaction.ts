import { transaction } from ".prisma/client";
import { t } from "../trpc";
import { z } from "zod";
import differenceInDays from "date-fns/differenceInDays";
import Dinero from "dinero.js";

export const transactionRouter = t.router({
  getNeedPayment: t.procedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const transactions = await ctx.prisma.invoice.findMany({
        where: { company_id: input, void: false },
        select: {
          invoice_id: true,
          invoice_template: {
            select: {
              due_date: true,
              final_notice: true,
            },
          },
          invoice_number: true,
          created_at: true,
          job_details: {
            select: {
              address: {
                select: {
                  address: true,
                  city: true,
                  client: true,
                },
              },
            },
          },
          transaction: {
            where: { account: "ACCOUNTS_PAYABLE" },
          },
        },
      });
      const filteredTransaction = transactions
        .map((item) => {
          let credit: transaction[] = [];
          let debit: transaction[] = [];
          item.transaction.map((t) => {
            t.transaction === "CREDIT" ? credit.push(t) : debit.push(t);
          });

          const debitTotal = debit.reduce((acc, cur) => {
            return acc + cur.amount;
          }, 0);

          const creditTotal = credit.reduce((acc, cur) => {
            return acc + cur.amount;
          }, 0);
          return { ...item, creditTotal, debitTotal };
        })
        .filter((i) => i.creditTotal > i.debitTotal);

      return filteredTransaction.map((i) => {
        return {
          invoice_number: i.invoice_number,
          invoice_id: i.invoice_id,
          client_name:
            i.job_details.address.client.first_name +
            " " +
            i.job_details.address.client.last_name,
          address: `${i.job_details.address.address}, ${i.job_details.address.city}`,
          email: i.job_details.address.client.email,
          paid: "$" + Dinero({ amount: i.debitTotal }).toFormat("0.00"),
          total: "$" + Dinero({ amount: i.creditTotal }).toFormat("0.00"),
          due:
            i.debitTotal > i.creditTotal
              ? 3
              : differenceInDays(new Date(), i.created_at) >
                (i.invoice_template?.due_date ?? 0) +
                  (i.invoice_template?.final_notice ?? 0)
              ? 2
              : differenceInDays(new Date(), i.created_at) >
                (i.invoice_template?.due_date ?? 0)
              ? 1
              : 0,

          date: i.created_at,
        };
      });
    }),
  paymentTransaction: t.procedure
    .input(
      z.object({
        invoice_id: z.string(),
        amount: z.number(),
        type: z.enum(["ETRANSFER", "CASH", "CHEQUE", "OTHER"]),
        reference_code: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.transaction.createMany({
        data: [
          {
            amount: input.amount,
            reference_code:
              input.type === "ETRANSFER" ? input.reference_code : "",
            payment_type: input.type,
            transaction: "DEBIT",
            account: "ACCOUNTS_PAYABLE",
            invoice_id: input.invoice_id,
          },
          {
            amount: input.amount,
            reference_code:
              input.type === "ETRANSFER" ? input.reference_code : "",
            transaction: "CREDIT",
            payment_type: input.type,
            account: "ACCOUNTS_RECIEVABLE",
            invoice_id: input.invoice_id,
          },
        ],
      });
    }),
  getAllPayment: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
    const transactions = await ctx.prisma.invoice.findMany({
      where: { company_id: input, void: false },
      select: {
        invoice_id: true,
        invoice_template: {
          select: {
            due_date: true,
            final_notice: true,
          },
        },
        invoice_number: true,
        created_at: true,
        job_details: {
          select: {
            address: {
              select: {
                address: true,
                city: true,
                client: true,
              },
            },
          },
        },
        transaction: {
          where: { account: "ACCOUNTS_PAYABLE" },
        },
      },
    });
    return transactions
      .map((item) => {
        let credit: transaction[] = [];
        let debit: transaction[] = [];
        item.transaction.map((t) => {
          t.transaction === "CREDIT" ? credit.push(t) : debit.push(t);
        });

        const debitTotal = debit.reduce((acc, cur) => {
          return acc + cur.amount;
        }, 0);

        const creditTotal = credit.reduce((acc, cur) => {
          return acc + cur.amount;
        }, 0);
        return { ...item, creditTotal, debitTotal };
      })
      .map((i) => {
        return {
          invoice_number: i.invoice_number,
          invoice_id: i.invoice_id,
          client_name:
            i.job_details.address.client.first_name +
            " " +
            i.job_details.address.client.last_name,
          address: `${i.job_details.address.address}, ${i.job_details.address.city}`,
          email: i.job_details.address.client.email,
          paid: "$" + Dinero({ amount: i.debitTotal }).toFormat("0.00"),
          total: "$" + Dinero({ amount: i.creditTotal }).toFormat("0.00"),
          due:
            i.debitTotal > i.creditTotal
              ? 3
              : differenceInDays(new Date(), i.created_at) >
                (i.invoice_template?.due_date ?? 0) +
                  (i.invoice_template?.final_notice ?? 0)
              ? 2
              : differenceInDays(new Date(), i.created_at) >
                (i.invoice_template?.due_date ?? 0)
              ? 1
              : 0,

          date: i.created_at,
        };
      });
  }),
});
