import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ColumnWithLooseAccessor } from "react-table";
import ReusableTable from "../../../component/ReusableTable";
import RadiantInput from "../../../component/input/RadiantInput";
import RadiantButton from "../../../component/input/RadiantButton";
import { trpc } from "../../../utils/trpc";
import NewJobModal from "../../../modal/NewJobModal";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import { isNotAdmin } from "../../../utils/util";

const ManageJobs = ({ session }: { session: Session }) => {
  const company_id = session.user.company_id;
  const { data: jobData, refetch: refetchJobs } =
    trpc.job.all.useQuery(company_id);

  const [jobDialog, setJobDialog] = useState(false);
  const [searchJob, setSearchJob] = useState<string | undefined>("");

  const columns: ColumnWithLooseAccessor[] = [
    { Header: "Job Number", accessor: "job_number" },
    { Header: "Client Name", accessor: "name" },
    { Header: "Address", accessor: "address" },
    { Header: "Status", accessor: "status" },
    {
      Header: "Information",
      accessor: "job_id",
      disableGlobalFilter: true,
      Cell: ({ cell: { value: jobId } }: { cell: { value: string } }) => {
        return (
          <Link href={`job/${jobId}`}>
            <a>
              <div>
                <RadiantButton>Job Information</RadiantButton>
              </div>
            </a>
          </Link>
        );
      },
    },
  ];
  const sortees = useMemo(
    () => [
      {
        id: "job_number",
        desc: true,
      },
    ],
    []
  );

  return (
    <>
      <Head>
        <title>Job</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="shadow flex flex-col flex-grow w-fill m-3 overflow-auto">
        <div>
          <h1 className="text-gray-700 text-center text-4xl font-bold">
            Manage Job Information
          </h1>
        </div>
        <div className="flex lg:flex-row flex-col  justify-between w-full mb-3 gap-3">
          <div>
            <RadiantInput
              label="Search Jobs"
              value={searchJob ?? ""}
              onChange={(e) => setSearchJob(e.target.value ?? undefined)}
            />
          </div>
          <div className="flex items-end">
            <RadiantButton
              onClick={() => {
                setJobDialog(true);
              }}
            >
              Create Job
            </RadiantButton>
          </div>
        </div>
        <ReusableTable
          GlobalFilter={searchJob}
          name="ClientList"
          sortees={sortees}
          columns={columns}
          data={jobData ?? []}
        />
        <NewJobModal
          session={session}
          dialog={jobDialog}
          setDialog={setJobDialog}
          refetch={refetchJobs}
        />
      </main>
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

export default ManageJobs;
