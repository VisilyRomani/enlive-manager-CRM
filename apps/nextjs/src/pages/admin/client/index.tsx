import React, { useState } from "react";
import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { trpc } from "../../../utils/trpc";
import { AppRouter } from "@acme/api/src/router";
import ReusableTable from "../../../component/ReusableTable";
import { ColumnWithLooseAccessor } from "react-table";
import Link from "next/link";
import RadiantButton from "../../../component/input/RadiantButton";
import NewClientModal from "../../../modal/NewClientModal";
import { getSession } from "next-auth/react";
import RadiantInput from "../../../component/input/RadiantInput";
import { Session } from "next-auth";
import { isNotAdmin } from "../../../utils/util";

const ManageClients = ({ session }: { session: Session }) => {
  const [newClientDialog, setNewClientDialog] = useState(false);
  const [clientFilter, setClientFilter] = useState<string | undefined>();

  const { data: clientData = [], refetch: refetchClients } =
    trpc.client.all.useQuery<AppRouter["client"]["all"]>(
      session.user.company_id
    );

  const columns: ColumnWithLooseAccessor[] = [
    { Header: "First", accessor: "first_name" },
    { Header: "Last", accessor: "last_name" },
    { Header: "Email", accessor: "email" },
    { Header: "Phone Number", accessor: "phone_number" },
    {
      Header: "Profile",
      accessor: "client_id",
      disableGlobalFilter: true,
      Cell: ({ cell: { value: client_id } }: { cell: { value: string } }) => {
        return (
          <Link href={`client/${client_id}`}>
            <a>
              <div>
                <RadiantButton>Client Profile</RadiantButton>
              </div>
            </a>
          </Link>
        );
      },
    },
  ];

  return (
    <>
      <Head>
        <title>Client</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="shadow flex flex-col flex-grow w-fill m-3 overflow-auto">
        <div>
          <h1 className="text-gray-700 text-center text-4xl font-bold mb-4">
            Manage Client Information
          </h1>
        </div>
        <div className="flex lg:flex-row flex-col  justify-between w-full mb-3 gap-3">
          <div>
            <RadiantInput
              label="Search Clients"
              value={clientFilter || ""}
              onChange={(e) => setClientFilter(e.target.value || undefined)}
            />
          </div>
          <div className="flex items-end">
            <RadiantButton
              type="button"
              onClick={() => setNewClientDialog(true)}
            >
              New Client
            </RadiantButton>
          </div>
        </div>
        <ReusableTable
          GlobalFilter={clientFilter}
          name="ClientList"
          columns={columns}
          data={clientData}
        />
      </main>
      <NewClientModal
        session={session}
        dialog={newClientDialog}
        setDialog={setNewClientDialog}
        refetch={refetchClients}
      />
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

export default ManageClients;
