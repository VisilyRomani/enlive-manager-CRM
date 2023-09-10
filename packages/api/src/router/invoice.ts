import { z } from "zod";
import { t } from "../trpc";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import cuid from "cuid";
import Dinero from "dinero.js";
import { Resend } from "resend";
import InvoiceTemplate from "../email/InvoiceTemplate";
import { render } from "@react-email/render";
import differenceInMinuts from "date-fns/differenceInMinutes";

export interface ITax {
  tax_id: string;
  name: string;
  percent: number;
  total: Dinero.Dinero;
}
export interface IInput {
  client: {
    address: {
      address: string;
      city: string;
    };
    job_id: string;
    email: string;
    invoice_number: number;
    payment: number;
    name: string;
    charge: {
      tax: {
        name: string;
        tax_id: string;
        percent: number;
      }[];
      product_service_id: string;
      price: number;
      quantity: number;
      description: string;
    }[];
  };
  invoice_template: {
    address: string | null;
    city: string | null;
    company_id: string;
    email: string | null;
    invoice_template_id: string | null;
    logo: string;
    gst: string | null;
    pst: string | null;
    phone: string | null;
    link: string | null;
    terms: string | null;
    footer: string | null;
    due_date: number | null;
    company_name: string;
  };
}

export const invoiceRouter = t.router({
  createNewInvoice: t.procedure
    .input(
      z.object({
        company_id: z.string(),
        job_id: z.string(),
        payment: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async () => {
        const company = await ctx.prisma.company.findUnique({
          where: { id: input.company_id },
          select: {
            company_name: true,
          },
        });
        const template = await ctx.prisma.invoice_template.findUnique({
          where: {
            company_id: input.company_id,
          },
          select: {
            invoice_template_id: true,
            company_id: true,
            logo: true,
            gst: true,
            pst: true,
            address: true,
            city: true,
            phone: true,
            link: true,
            email: true,
            terms: true,
            footer: true,
            due_date: true,
          },
        });

        const client = await ctx.prisma.job_details.findUnique({
          where: { job_id: input.job_id },
          select: {
            job_number: true,
            job_id: true,
            address: {
              select: {
                address: true,
                city: true,
                client: {
                  select: {
                    email: true,
                    first_name: true,
                    last_name: true,
                  },
                },
              },
            },
            job_task: {
              select: {
                price: true,
                quantity: true,
                product_service: {
                  select: {
                    product_service_id: true,
                    name: true,
                    product_service_tax: {
                      select: {
                        tax: {
                          select: {
                            tax_id: true,
                            name: true,
                            percent: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
        if (client && template && company) {
          const { calculateTotals, total } = calculateInvoiceData({
            charge: client?.job_task.map((jt) => ({
              product_service_id: jt.product_service.product_service_id,
              description: jt.product_service.name,
              tax: jt.product_service.product_service_tax.map((t) => ({
                ...t.tax,
              })),
              quantity: jt.quantity,
              price: jt.price,
            })),
          });
          const result = {
            invoice_template: {
              ...template,
              company_name: company.company_name,
              logo: String(process.env.CLOUDFLARE_PUBLIC) + template.logo,
            },
            client: {
              payment: input.payment,
              name:
                client?.address.client.first_name +
                " " +
                client?.address.client.last_name,
              address: {
                address: client?.address.address,
                city: client?.address.city,
              },
              job_id: client.job_id,
              email: client.address.client.email,
              invoice_number: client?.job_number,
              charge: client?.job_task.map((jt) => ({
                product_service_id: jt.product_service.product_service_id,
                description: jt.product_service.name,
                tax: jt.product_service.product_service_tax.map((t) => ({
                  ...t.tax,
                })),
                quantity: jt.quantity,
                price: jt.price,
              })),
            },
          };
          return {
            ...result,
            __html: render(
              InvoiceTemplate({ calculateTotals, total, input: result })
            ),
          };
        }
      });
    }),
  invoiceEmailPreview: t.procedure
    .input(
      z.object({
        invoice_template: z.object({
          company_name: z.string(),
          invoice_template_id: z.string().nullable(),
          company_id: z.string(),
          logo: z.string(),
          gst: z.string().nullable(),
          pst: z.string().nullable(),
          address: z.string().nullable(),
          city: z.string().nullable(),
          phone: z.string().nullable(),
          link: z.string().nullable(),
          email: z.string().nullable(),
          terms: z.string().nullable(),
          footer: z.string().nullable(),
          due_date: z.number().nullable(),
        }),
        client: z.object({
          job_id: z.string(),
          name: z.string(),
          email: z.string(),
          payment: z.number(),
          address: z.object({
            address: z.string(),
            city: z.string(),
          }),
          invoice_number: z.number(),
          charge: z.array(
            z.object({
              product_service_id: z.string(),
              description: z.string(),
              tax: z.array(
                z.object({
                  tax_id: z.string(),
                  name: z.string(),
                  percent: z.number(),
                })
              ),
              quantity: z.number(),
              price: z.number(),
            })
          ),
        }),
      })
    )
    .query(async ({ input }) => {
      return CreateHtmlInvoice(input);
    }),
  completeInvoiceTransaction: t.procedure
    .input(
      z.object({
        invoice_template: z.object({
          company_name: z.string(),
          invoice_template_id: z.string().nullable(),
          company_id: z.string(),
          logo: z.string(),
          gst: z.string().nullable(),
          pst: z.string().nullable(),
          address: z.string().nullable(),
          city: z.string().nullable(),
          phone: z.string().nullable(),
          link: z.string().nullable(),
          email: z.string().nullable(),
          terms: z.string().nullable(),
          footer: z.string().nullable(),
          due_date: z.number().nullable(),
        }),
        client: z.object({
          job_id: z.string(),
          name: z.string(),
          email: z.string(),
          payment: z.number(),
          address: z.object({
            address: z.string(),
            city: z.string(),
          }),
          invoice_number: z.number(),
          charge: z.array(
            z.object({
              product_service_id: z.string(),
              description: z.string(),
              tax: z.array(
                z.object({
                  tax_id: z.string(),
                  name: z.string(),
                  percent: z.number(),
                })
              ),
              quantity: z.number(),
              price: z.number(),
            })
          ),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const last_email = await ctx.prisma.email_validate.findFirst({
        where: { job_id: input.client.job_id },
        orderBy: { created_at: "desc" },
        select: { created_at: true },
      });
      // Check email sent interval
      if (
        !!last_email?.created_at &&
        differenceInMinuts(new Date(), last_email.created_at) < 5
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Existing email sent less than 5 minutes ago",
          cause: "Prev email for job_id sent less than 5 min ago.",
        });
      }

      const invoice_key = `invoice/${input.client.invoice_number}/${cuid()}`;

      const { total, calculateTotals } = calculateInvoiceData({
        charge: input.client.charge,
      });
      const response = await fetch(
        `${String(process.env.URL)}/api/pdf/invoice`,
        {
          method: "POST",
          body: JSON.stringify({ ...input }),
        }
      );
      const pdf = await response.blob();
      if (
        total.getAmount() === 0 &&
        calculateTotals.subtotal.getAmount() !== 0
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Calculating Total Cost error",
        });
      }
      const invoiceCreate = ctx.prisma.invoice.create({
        data: {
          company_id: input.invoice_template.company_id,
          invoice_number: input.client.invoice_number,
          sent_at: new Date(),
          payment: ~~(input.client.payment * 100),
          invoice_location: {
            create: {
              invoice_key: invoice_key,
              type: "INVOICE",
            },
          },
          invoice_data: {
            createMany: {
              data: input.client.charge.map((c) => ({
                product_service_id: c.product_service_id,
                price: c.price,
                quantity: c.quantity,
              })),
            },
          },
          job_details: {
            connect: {
              job_id: input.client.job_id,
            },
          },
          invoice_template: {
            connect: {
              company_id: input.invoice_template.company_id,
            },
          },
          transaction: {
            createMany: {
              data: [
                {
                  amount: total
                    .subtract(
                      Dinero({
                        amount: ~~((input.client.payment ?? 0) * 100),
                      })
                    )
                    .getAmount(),
                  transaction: "CREDIT",
                  account: "ACCOUNTS_PAYABLE",
                },
                {
                  amount: total
                    .subtract(
                      Dinero({
                        amount: ~~((input.client.payment ?? 0) * 100),
                      })
                    )
                    .getAmount(),
                  transaction: "DEBIT",
                  account: "ACCOUNTS_RECIEVABLE",
                },
              ],
            },
          },
        },
      });

      const s3Upload = UploadS3(
        input.invoice_template.company_id,
        pdf,
        ctx.s3,
        invoice_key
      );

      try {
        const mail = await MailInvoice(
          input,
          total,
          calculateTotals,
          pdf,
          ctx.mail
        );

        if ("statusCode" in mail && "message" in mail) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: mail.message as string,
          });
        } else {
          await ctx.prisma.email_validate.create({
            data: {
              job_id: input.client.job_id,
            },
          });
        }
        /**
         * ERROR HANDLING
         * If the error is within s3 the db wont update.
         */

        const result = await Promise.all([s3Upload, invoiceCreate]);
        return [...result, mail];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: JSON.stringify(error),
        });
      }
    }),
  getInvoice: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    const invoice = await ctx.prisma.invoice.findUnique({
      where: { invoice_id: input },
      select: {
        job_id: true,
        invoice_number: true,
        job_details: {
          select: {
            address: {
              select: {
                client: {
                  select: {
                    client_id: true,
                    first_name: true,
                    last_name: true,
                  },
                },
              },
            },
          },
        },
        transaction: {
          where: {
            account: "ACCOUNTS_PAYABLE",
          },
        },
      },
    });
    if (invoice) {
      return {
        job_id: invoice.job_id,
        client_id: invoice.job_details.address.client.client_id,
        client_name:
          invoice.job_details.address.client.first_name +
          " " +
          invoice.job_details.address.client.last_name,
        invoice_number: invoice.invoice_number,
        transaction: {
          credit: invoice.transaction.filter((t) => t.transaction === "CREDIT"),
          debit: invoice.transaction.filter((t) => t.transaction === "DEBIT"),
        },
      };
    } else {
      throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
    }
  }),
});

const UploadS3 = async (
  company_id: string,
  pdf: Blob,
  s3: S3Client,
  invoice_key: string
) => {
  const command = new PutObjectCommand({
    Bucket: company_id,
    Key: invoice_key,
    ContentType: "application/pdf",
    Body: new Uint8Array(await pdf.arrayBuffer()),
  });

  return s3.send(command);
};

const MailInvoice = async (
  input: IInput,
  total: Dinero.Dinero,
  calculateTotals: { tax: ITax[]; subtotal: Dinero.Dinero },
  pdf: Blob,
  mail: Resend
) => {
  const props = {
    input,
    total,
    calculateTotals,
  };

  const mailOptions = {
    from: String(process.env.EMAIL_STRING),
    to: input.client.email,
    subject: `${input.invoice_template.company_name} | Invoice No: ${input.client.invoice_number}`,
    react: InvoiceTemplate(props),
    attachments: [
      {
        filename: `invoice-${input.client.invoice_number}.pdf`,
        content: Buffer.from(new Uint8Array(await pdf.arrayBuffer())),
      },
    ],
  };
  return mail.emails.send(mailOptions);
};

const CreateHtmlInvoice = (input: IInput) => {
  const { calculateTotals, total } = calculateInvoiceData({
    charge: input.client.charge,
  });

  const props = {
    input,
    calculateTotals,
    total,
  };
  return render(InvoiceTemplate(props));
};

const calculateInvoiceData = ({
  charge,
}: {
  charge: {
    product_service_id: string;
    description: string;
    tax: { tax_id: string; name: string; percent: number }[];
    quantity: number;
    price: number;
  }[];
}) => {
  const calculateTotals = charge.reduce(
    (acc, cur) => {
      cur.tax.map((t) => {
        const tax = acc.tax.find((at) => at.tax_id === t.tax_id);
        if (!tax) {
          acc.tax.push({
            ...t,
            total: Dinero({ amount: cur.price }).multiply(cur.quantity),
          });
        } else {
          const total = tax.total.add(
            Dinero({ amount: cur.price }).multiply(cur.quantity)
          );
          tax.total = total;
        }
      });

      return {
        ...acc,
        subtotal: acc.subtotal.add(
          Dinero({ amount: cur.price }).multiply(cur.quantity)
        ),
      };
    },
    {
      tax: [] as ITax[],
      subtotal: Dinero({ amount: 0 }),
    }
  );

  const total = calculateTotals.subtotal.add(
    calculateTotals.tax
      .map((t) => t.total.multiply(t.percent / 100))
      .reduce((acc, cur) => {
        return acc.add(cur);
      }, Dinero({ amount: 0 }))
  );

  if (total.getAmount() === 0 && calculateTotals.subtotal.getAmount() !== 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Calculating Total Cost error",
    });
  }

  return { calculateTotals, total };
};
