import { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit-table";
import blobStream from "blob-stream";
import addDays from "date-fns/addDays";
import format from "date-fns/format";
import Dinero from "dinero.js";

interface ITax {
  tax_id: string;
  name: string;
  percent: number;
  total: Dinero.Dinero;
}

interface INewInvoice {
  invoice_template: {
    company_name: string;
    invoice_template_id: string;
    company_id: string;
    logo: string | null;
    gst: string | null;
    pst: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
    link: string | null;
    email: string | null;
    terms: string | null;
    footer: string | null;
    due_date: number | null;
  };
  client: {
    job_id: string;
    name: string;
    payment: number;
    address: {
      address: string;
      city: string;
    };
    invoice_number: number;
    charge: {
      description: string;
      tax: {
        tax_id: string;
        name: string;
        percent: number;
      }[];
      quantity: number;
      price: number;
    }[];
  };
}

const SKY_600 = "#0284c7";
const SKY_400 = "#38bdf8";

const ZINC_500 = "#71717a";
const GRAY_400 = "#9ca3af";
Dinero.globalLocale = "CAD";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method;
  const { invoice_template, client }: INewInvoice = JSON.parse(req.body);
  switch (method) {
    case "POST":
      const calculateTotals = client.charge.reduce(
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

      const doc = new PDFDocument({
        bufferPages: true,
        margins: {
          top: 40,
          bottom:
            60 +
            20 * (invoice_template?.footer?.split(/\r\n|\r|\n/)?.length ?? 1),
          left: 30,
          right: 30,
        },
      });

      //   Invoice Header
      doc
        .font("Helvetica-Bold")
        .lineGap(4)
        .fontSize(12)
        .text(invoice_template.company_name);
      doc
        .font("Helvetica")
        .fontSize(8)
        .text(invoice_template.address ?? "");
      doc.text(invoice_template.city ?? "");
      doc.text(invoice_template.phone ?? "");
      doc.text(invoice_template.link ?? "");
      if (!!invoice_template.gst) {
        doc.text(`GST Registration No.: ${invoice_template.gst}`);
      }
      if (!!invoice_template.pst) {
        doc.text(`PST Registration No.: ${invoice_template.pst}`);
      }
      const image = await fetchImage(invoice_template.logo ?? "");
      doc.image(image, doc.page.width - 150 - 30, 40, {
        fit: [150, 100],
      });
      doc.moveDown(4);

      // Invoice Client Body
      doc.fillColor(SKY_600).fontSize(14).text("INVOICE");
      doc.fillColor(ZINC_500).fontSize(10).text("BILL TO");
      doc.fillColor("black").text(client.name);
      doc.text(client.address?.address);
      doc.text(client.address?.city);

      doc.moveUp(5);
      doc.fillColor(ZINC_500).fontSize(10).text("INVOICE", 400);
      doc.text("DATE", 400);
      doc.text("TERMS", 400);
      doc.text("DUE DATE", 400);

      doc.moveUp(5);
      doc
        .fillColor("black")
        .text((client?.invoice_number ?? 1111).toString(), 475);
      doc.text(format(new Date(), "yyyy-MM-dd"), 475);
      doc.text(invoice_template.terms ?? "", 475);
      doc.text(
        format(
          addDays(new Date(), invoice_template.due_date ?? 0),
          "yyyy-MM-dd"
        ),
        475
      );
      doc.moveDown(2);

      //Invoice Table

      const table_data = {
        headers: [
          {
            label: "DESCRIPTION",
            property: "description",
            width: 250,
            headerColor: SKY_400,
            padding: 5,
            valign: "center",
          },
          {
            label: "TAX",
            property: "tax",
            width: 75,
            headerColor: SKY_400,
            padding: 5,
          },
          {
            label: "QTY",
            property: "quantity",
            width: 75,
            headerColor: SKY_400,
            headerAlign: "center",
            align: "right",
            padding: 5,
          },
          {
            label: "RATE",
            property: "rate",
            width: 75,
            headerColor: SKY_400,
            headerAlign: "center",
            align: "right",
            padding: 5,
          },
          {
            label: "AMOUNT",
            property: "amount",
            width: 75,
            headerColor: SKY_400,
            headerAlign: "center",
            align: "right",
            padding: 5,
          },
        ],
        datas:
          client.charge.map((c) => ({
            description: c.description,
            tax: c.tax
              .map((t) => t.name)
              .toString()
              .replaceAll(",", "/"),
            quantity: c.quantity.toString(),
            rate: Dinero({ amount: c.price }).toFormat("0.00"),
            amount: Dinero({ amount: c.price })
              .multiply(c.quantity)
              .toFormat("0.00"),
          })) ?? [],
        options: {
          columnSpacing: 5,
          prepareHeader: () =>
            doc.font("Helvetica").fontSize(12).fillColor(SKY_600),
          prepareRow: () => {
            doc.fillColor("black").font("Helvetica").fontSize(12);
          },
          divider: {
            header: { disabled: true },
            horizontal: { disabled: true, width: 1, opacity: 1 },
          },
        },
      };
      doc.x = 0;
      doc.table(table_data);

      if (doc.y >= 540) {
        doc.addPage();
      }
      doc
        .moveTo(30, doc.y)
        .lineTo(doc.page.width - 30, doc.y)
        .dash(3, { space: 5 })
        .stroke(GRAY_400);
      doc.moveDown(1);
      doc.fillColor(GRAY_400).text("SUBTOTAL", doc.page.width / 2);
      doc.moveUp(1);

      doc.text(
        calculateTotals.subtotal.toFormat("0.00") ?? "",
        doc.page.width -
          (40 + doc.widthOfString(calculateTotals.subtotal.toFormat("0.00"))),
        doc.y,
        { lineBreak: false, align: "right" }
      );
      doc.moveDown(1);

      let total = calculateTotals.subtotal;

      if (calculateTotals) {
        for (let i = 0; i < (calculateTotals.tax.length ?? 0); i++) {
          const curTax = calculateTotals.tax.at(i);

          if (curTax) {
            doc.text(
              `${curTax?.name} @ ${curTax?.percent}%`,
              doc.page.width / 2
            );

            doc.moveUp(1);
            doc.text(
              curTax.total.multiply(curTax.percent / 100).toFormat("0.00") ??
                "",
              doc.page.width -
                (doc.widthOfString(
                  curTax.total.multiply(curTax.percent / 100).toFormat("0.00")
                ) +
                  40),
              doc.y,
              {
                lineBreak: false,
                align: "right",
              }
            );
            total = total.add(curTax.total.multiply(curTax.percent / 100));
          }

          doc.moveDown(1);
        }
      }

      const balance_due = total.subtract(
        Dinero({ amount: ~~((client.payment ?? 0) * 100) })
      );

      if (client.payment) {
        doc.text("TOTAL", doc.page.width / 2);
        doc.moveUp(1);

        doc.text(
          total.toFormat("0.00"),
          doc.page.width - (doc.widthOfString(total.toFormat("0.00")) + 40),
          doc.y,
          {
            lineBreak: false,
            align: "right",
          }
        );
        doc.moveDown(1);
        doc.text("PAYMENT", doc.page.width / 2);
        doc.moveUp(1);

        doc.text(
          Dinero({ amount: ~~(client.payment * 100) }).toFormat("0.00"),
          doc.page.width -
            (doc.widthOfString(
              Dinero({ amount: ~~(client.payment * 100) }).toFormat("0.00")
            ) +
              40),
          doc.y,
          {
            lineBreak: false,
            align: "right",
          }
        );
        doc.moveDown(1);
      }
      doc
        .moveTo(doc.page.width / 2, doc.y)
        .lineTo(doc.page.width - 30, doc.y)
        .dash(3, { space: 5 })
        .stroke(GRAY_400);
      doc.moveDown(1);
      doc.text("BALANCE DUE", doc.page.width / 2);
      doc.moveUp(1);
      doc
        .fillColor("black")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(
          "$" + balance_due.toFormat("0.00"),
          doc.page.width -
            (doc.widthOfString("$" + balance_due.toFormat("0.00")) + 40),
          doc.y,
          {
            lineBreak: false,
            align: "right",
          }
        );

      doc.moveDown(2);
      if (doc.y >= 540) {
        doc.addPage();
      }
      // Tax table
      doc.x = 0;

      const tax_table = {
        headers: [
          {
            label: "RATE",
            property: "rate",
            width: 250,
            headerColor: SKY_400,
            align: "right",
          },
          {
            label: "Tax",
            property: "tax",
            width: 150,
            headerColor: SKY_400,
            align: "right",
          },
          {
            label: "NET",
            property: "net",
            width: 150,
            headerColor: SKY_400,
            align: "right",
          },
        ],
        datas: calculateTotals.tax.map((t) => ({
          rate: `${t.name} @ ${t.percent}%`,
          tax: t.total.multiply(t.percent / 100).toFormat("0.00"),
          net: t.total.toFormat("0.00"),
        })),
        options: {
          title: {
            label: "TAX SUMMARY",
            fontFamily: "Helvetica-Bold",
            color: SKY_600,
          },
          columnSpacing: 5,
          padding: 5,
          prepareHeader: () =>
            doc.font("Helvetica").fontSize(12).fillColor(SKY_600),
          prepareRow: () => {
            doc.fillColor("black").font("Helvetica").fontSize(12);
          },
          divider: {
            header: { disabled: true },
            horizontal: { disabled: true, width: 1, opacity: 1 },
          },
        },
      };

      doc.table(tax_table);
      doc
        .fillColor(GRAY_400)
        .fontSize(14)
        .font("Helvetica")
        .text(invoice_template?.footer ?? "", { align: "center" });

      // Footer Loop
      const pages = doc.bufferedPageRange();

      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.x = 30;
        doc.y = doc.page.height - 50;

        doc
          .fillColor(GRAY_400)
          .fontSize(14)
          .font("Helvetica")
          .text(`Page: ${i + 1} of ${pages.count}`, {
            lineBreak: false,
          });
      }

      doc.pipe(res.writeHead(200, { "Content-Type": "application/pdf" }));
      doc.end();

      const stream = doc.pipe(blobStream());
      stream.on("finish", function () {
        //for live invoices
        const blob = stream.toBlob("application/pdf");
        // console.log(blob);
      });
      break;
  }
};

const fetchImage = async (src: string) => {
  const response = await fetch(src);
  if (response.ok) {
    return await response.arrayBuffer();
  } else {
    throw Error(response.statusText);
  }
};

export default handler;
