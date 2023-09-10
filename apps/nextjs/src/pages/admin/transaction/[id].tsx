import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { isNotAdmin } from "../../../utils/util";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { trpc } from "../../../utils/trpc";
import { ColumnWithLooseAccessor } from "react-table";
import ReusableTable from "../../../component/ReusableTable";
import format from "date-fns/format";
import Dinero from "dinero.js";
import RadiantButton from "../../../component/input/RadiantButton";
import { Session } from "next-auth";
import { toast } from "react-toastify";

const InvoiceTransaction = ({ session }: { session: Session }) => {
  const router = useRouter();

  const id = router.query.id as string;

  const { data: invoiceData } = trpc.invoice.getInvoice.useQuery(id);

  const { refetch } = trpc.invoiceLocation.getInvoicePDF.useQuery(
    { invoice_id: id, company_id: session.user.company_id },
    {
      enabled: false,
    }
  );

  const columns: ColumnWithLooseAccessor[] = [
    {
      Header: "Paid Date",
      accessor: "date",
      Cell: ({ cell: { value } }: { cell: { value: Date } }) => {
        return <p className="h-10">{format(value, "dd-MM-yyyy")}</p>;
      },
    },
    { Header: "Reference Code", accessor: "reference_code" },
    { Header: "Transaction", accessor: "payment_type" },
    {
      Header: "Amount",
      accessor: "amount",
      Cell: ({ cell: { value } }: { cell: { value: number } }) => {
        return (
          <p className="h-10">${Dinero({ amount: value }).toFormat("0.00")}</p>
        );
      },
    },
  ];

  return (
    <main className="shadow flex flex-col flex-grow w-fill m-3 overflow-auto">
      <Head>
        <title>Invoice</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {invoiceData ? (
        <div className="flex  flex-col gap-3">
          <div className="m-3 gap-3 grid grid-cols-1 md:grid-cols-2">
            <Link href={`/admin/client/${invoiceData?.client_id}`}>
              <a>
                <div>
                  <label className="uppercase tracking-wide text-gray-700 text-xs font-bold m-1">
                    Client Name
                  </label>
                  <p className="border border-gray-200 text-gray-700 text-sm bg-gray-50 focus:outline-gray-700  rounded-sm p-2.5 hover:bg-violet-200 shadow-md">
                    {invoiceData.client_name}
                  </p>
                </div>
              </a>
            </Link>
            <Link href={`/admin/job/${invoiceData?.job_id}`}>
              <a>
                <div>
                  <label className="uppercase tracking-wide text-gray-700 text-xs font-bold m-1">
                    Job Number
                  </label>
                  <p className="border border-gray-200 text-gray-700 text-sm bg-gray-50 focus:outline-gray-700  rounded-sm p-2.5 hover:bg-violet-200 shadow-md">
                    {invoiceData.invoice_number}
                  </p>
                </div>
              </a>
            </Link>
            <RadiantButton
              onClick={async () => {
                const signedUrl = await refetch();
                if (!signedUrl.data) {
                  toast.error("Cant Find Invoice");
                } else {
                  const link = document.createElement("a");
                  link.href = signedUrl.data ?? "";
                  link.download = "Invoice";
                  link.target = "_blank";
                  link.click();
                }
              }}
            >
              Download Invoice PDF
            </RadiantButton>
            <RadiantButton>Download Receipt PDF</RadiantButton>
          </div>
          <div className="flex flex-col md:flex-row justify-between h-fit gap-3 m-3">
            <div className="flex justify-center items-center w-full flex-col border border-cyan-300 p-10">
              <p className="text-cyan-500">INVOICED</p>
              <p className="text-xl font-bold">
                {" "}
                $
                {Dinero({
                  amount: invoiceData.transaction.credit.reduce((acc, cur) => {
                    return acc + cur.amount;
                  }, 0),
                }).toFormat("0.00")}
              </p>
            </div>
            <div className="flex justify-center items-center w-full flex-col border border-red-300 p-10">
              <p className="text-red-500">OUTSTANDING</p>
              <p className="text-xl font-bold">
                $
                {Dinero({
                  amount: invoiceData.transaction.credit.reduce((acc, cur) => {
                    return acc + cur.amount;
                  }, 0),
                })
                  .subtract(
                    Dinero({
                      amount: invoiceData.transaction.debit.reduce(
                        (acc, cur) => {
                          return acc + cur.amount;
                        },
                        0
                      ),
                    })
                  )
                  .toFormat("0.00")}
              </p>
            </div>
            <div className="flex justify-center items-center w-full flex-col border border-green-300 p-10">
              <p className="text-green-500">PAID</p>
              <p className="text-xl font-bold">
                {" "}
                $
                {Dinero({
                  amount: invoiceData.transaction.debit.reduce((acc, cur) => {
                    return acc + cur.amount;
                  }, 0),
                }).toFormat("0.00")}
              </p>
            </div>
          </div>
          <div className="m-3 h-96">
            <ReusableTable
              name="transaction"
              data={invoiceData.transaction.debit}
              columns={columns}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
    </main>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext<never>
) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  } else if (
    !session?.user?.company_id ||
    isNotAdmin(session?.user?.user_role)
  ) {
    return {
      redirect: {
        destination: "/admin/company",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
export default InvoiceTransaction;
