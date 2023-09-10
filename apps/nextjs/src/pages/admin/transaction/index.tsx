import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { isNotAdmin } from "../../../utils/util";
import { Session } from "next-auth";
import { ColumnWithLooseAccessor } from "react-table";
import ReusableTable from "../../../component/ReusableTable";
import { useEffect, useMemo, useState } from "react";
import { TopTab } from "../../../component/TopTab";
import RadiantButton from "../../../component/input/RadiantButton";
import { trpc } from "../../../utils/trpc";
import format from "date-fns/format";
import { CreateInvoiceModal } from "../../../modal/CreateInvoiceModal";
import Head from "next/head";

import PaymentModal from "../../../modal/PaymentModal";
import Link from "next/link";
import { FaCircle } from "react-icons/fa";
import RadiantInput from "../../../component/input/RadiantInput";
import RadiantSelect from "../../../component/input/RadiantSelect";

const Transactions = ({ session }: { session: Session }) => {
  const [tab, setTab] = useState(0);
  const [dialog, setDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [tableFilter, setTableFilter] = useState({ label: "", value: "" });

  const { data, refetch: refetchCompleted } = trpc.job.completedJobs.useQuery(
    session.user.company_id
  );

  const { data: paymentJobs, refetch: refetchPayment } =
    trpc.transaction.getNeedPayment.useQuery(session.user.company_id);

  const { data: allPayment, refetch: refetchAllPayment } =
    trpc.transaction.getAllPayment.useQuery(session.user.company_id);

  const [jobID, setJobID] = useState<string>();

  const invoiceColumns: ColumnWithLooseAccessor[] = [
    { Header: "Job Number", accessor: "job_number" },
    {
      Header: "Client Name",
      accessor: "name",
    },
    { Header: "Email", accessor: "email" },
    { Header: "Address", accessor: "address" },
    {
      Header: "Tasks",
      accessor: "job_task",
      Cell: ({ cell: { value: job_task } }: { cell: { value: string[] } }) => {
        return (
          <ul className="flex flex-col ">
            {job_task.map((jt, idx) => (
              <li className="list-disc text-left mx-3 my-2" key={idx}>
                {jt}
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      Header: "Completed at",
      accessor: "end_time",
      Cell: ({ cell: { value: end_time } }: { cell: { value: Date } }) => {
        const time = format(end_time, "hh:mmaaa dd-MM-yyyy").split(" ");
        return end_time ? (
          <>
            <p>{time[0]}</p>
            <p>{time[1]}</p>
          </>
        ) : (
          <div>Missing Time</div>
        );
      },
    },
    {
      Header: "",
      accessor: "job_id",
      Cell: ({ cell: { value: job_id } }: { cell: { value: string } }) => {
        return (
          <RadiantButton
            onClick={() => {
              setJobID(job_id);
              setDialog(true);
            }}
          >
            Create Invoice
          </RadiantButton>
        );
      },
    },
  ];
  const sortees = useMemo(
    () => [
      {
        id: "invoice_id",
        desc: true,
      },
    ],
    []
  );

  useEffect(() => {
    setTableFilter({ label: "", value: "" });
    setGlobalFilter("");
  }, [tab, setTableFilter]);

  const initFilters = [{ id: "due.status", value: "3" }];

  const paymentColumns: ColumnWithLooseAccessor[] = [
    {
      Header: "Invoice Number",
      accessor: "invoice_number",
      id: "invoice_number",
    },
    { Header: "Client Name", accessor: "client_name" },
    { Header: "Email", accessor: "email" },
    { Header: "Address", accessor: "address" },
    {
      Header: "Sent",
      accessor: "date",
      Cell: ({ cell: { value: date } }: { cell: { value: Date } }) => {
        return <div>{format(date, "dd-MM-yyyy")}</div>;
      },
    },
    {
      Header: "Due",
      accessor: "due",
      Cell: ({ cell: { value: due } }: { cell: { value: number } }) => {
        return (
          <div className="flex flex-col items-center">
            <FaCircle
              className={`${
                due === 3
                  ? "text-cyan-300"
                  : due === 2
                  ? "text-red-300"
                  : due === 1
                  ? "text-amber-300"
                  : "text-green-300"
              }`}
            />
          </div>
        );
      },
    },
    {
      Header: "Paid",
      accessor: "paid",
      disableFilters: true,
      disableGlobalFilter: true,
    },
    {
      Header: "Total",
      accessor: "total",
      disableFilters: true,
      disableGlobalFilter: true,
    },

    {
      Header: "Buttons",
      accessor: "invoice_id",
      disableFilters: true,
      disableGlobalFilter: true,
      Cell: ({ cell: { value: invoice_id } }: { cell: { value: string } }) => {
        return (
          <div className="flex justify-center flex-col gap-2 p-1 text-green-300">
            <RadiantButton
              onClick={() => {
                setInvoiceId(invoice_id);
                setPaymentDialog(true);
              }}
            >
              Payment
            </RadiantButton>
            <Link href={`transaction/${invoice_id}`}>
              <a>
                <RadiantButton className="w-full">Info</RadiantButton>
              </a>
            </Link>
          </div>
        );
      },
    },
  ];
  return (
    <>
      <main className="shadow flex flex-col flex-grow w-fill m-3 overflow-auto">
        <Head>
          <title>Transaction</title>
          <meta
            name="description"
            content="Create and manage your company's information"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="w-full ">
          <h1 className="text-gray-700 text-center text-4xl font-bold mb-4">
            Manage Invoices
          </h1>
          <div className="flex flex-col md:flex-row justify-between mx-3">
            <TopTab
              tab={tab}
              setTab={setTab}
              tabLabel={["To Send", "Payment", "All Sent"]}
            />
            <div className="flex items-center m-1 gap-3 md:flex-row flex-col">
              {tab !== 0 && (
                <RadiantSelect
                  label="Due"
                  value={tableFilter}
                  options={[
                    { label: "On time", value: "0" },
                    { label: "Late", value: "1" },
                    { label: "Overdue", value: "2" },
                    { label: "Completed", value: "3" },
                  ]}
                  onChange={(e) => {
                    setTableFilter({
                      label: e?.label ?? "",
                      value: e?.value ?? "",
                    });
                  }}
                />
              )}
              <RadiantInput
                label="Search"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
        <ReusableTable
          name="Invoice"
          GlobalFilter={globalFilter}
          initFilters={initFilters}
          filter={
            tab !== 0 ? { id: "due", value: tableFilter.value } : undefined
          }
          sortees={sortees}
          data={
            tab === 0
              ? data ?? []
              : tab === 1
              ? paymentJobs ?? []
              : allPayment ?? []
          }
          columns={tab === 0 ? invoiceColumns : paymentColumns}
        />
      </main>
      {paymentDialog && (
        <PaymentModal
          dialog={paymentDialog}
          setDialog={setPaymentDialog}
          invoice_id={invoiceId}
          refetch={() => {
            refetchCompleted();
            refetchAllPayment();
            refetchPayment();
          }}
        />
      )}
      {dialog && (
        <CreateInvoiceModal
          dialog={dialog}
          setDialog={setDialog}
          refetch={() => {
            refetchCompleted();
            refetchAllPayment();
            refetchPayment();
          }}
          company_id={session.user.company_id}
          job_id={jobID}
        />
      )}
    </>
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

export default Transactions;
