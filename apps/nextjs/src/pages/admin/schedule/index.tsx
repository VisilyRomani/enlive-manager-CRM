import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next/types";
import Head from "next/head";
import React, { useState } from "react";
import Calendar from "../../../component/Calendar";
import ReusableTable from "../../../component/ReusableTable";
import { ColumnWithLooseAccessor } from "react-table";
import RadiantButton from "../../../component/input/RadiantButton";
import NewScheduleGroup from "../../../modal/NewScheduleGroup";
import { Session } from "next-auth";
import { trpc } from "../../../utils/trpc";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { isNotAdmin } from "../../../utils/util";
import Link from "next/link";

const Schedule = ({ session }: { session: Session }) => {
  const [calendarDate, setCalendarDate] = useState<Date>(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const { data: scheduleData, refetch } =
    trpc.schdule.getScheduleByMonth.useQuery({
      start: startOfMonth(calendarDate),
      end: endOfMonth(calendarDate),
      company_id: session.user.company_id,
    });
  const [visible, setVisible] = useState(false);
  const columns: ColumnWithLooseAccessor[] = [
    {
      Header: "Schedule Name",
      accessor: "schedule_name",
    },
    {
      Header: "Job #",
      accessor: "job_details",
      Cell: ({
        cell: { value: job_details },
      }: {
        cell: { value: { job_number: number }[] };
      }) => {
        return (
          <div className="flex flex-row gap-3 justify-center">
            {job_details.map((j, i) => (
              <div className="flex flex-row gap-1" key={i}>
                #{j.job_number}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      Header: "Workers",
      accessor: "user_schedule",
      Cell: ({
        cell: { value: users },
      }: {
        cell: { value: { user: { name: string } }[] };
      }) => {
        return (
          <ul>
            {users.map(({ user }, i) => (
              <li className="flex flex-col" key={i}>
                {user.name}
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      Header: "Completed",
      accessor: "completed",
      Cell: ({ cell: { value } }: { cell: { value: boolean } }) => {
        return <div>{value ? "COMPLETED" : "INCOMPLETE"}</div>;
      },
    },
    {
      Header: "Information",
      id: "moreinfo",
      accessor: "schedule_id",
      Cell: ({ cell: { value: schedule_id } }: { cell: { value: string } }) => {
        return (
          <Link href={`/admin/schedule/${schedule_id}`}>
            <a>
              <RadiantButton>Edit Schedule</RadiantButton>
            </a>
          </Link>
        );
      },
    },
  ];
  return (
    <>
      <Head>
        <title>Schedule</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="shadow flex flex-col flex-grow w-fill m-3 overflow-auto">
        <h1 className="text-gray-700 text-center text-4xl font-bold mb-4">
          Schedule Jobs
        </h1>
        <div className="flex flex-col md:flex-row-reverse w-full gap-3">
          <div className="grid lg:w-2/3 w-full ">
            <Calendar
              date={calendarDate}
              selectedDate={setCalendarDate}
              data={scheduleData?.map((sd) => {
                return { date: sd.date, completed: sd.completed };
              })}
            />
            <div className="flex w-full justify-end">
              <RadiantButton
                className="w-full"
                onClick={() => {
                  setVisible(true);
                }}
              >
                Schedule Jobs
              </RadiantButton>
            </div>
          </div>
          <div className="w-full">
            <ReusableTable
              name="Job Group"
              data={
                scheduleData?.filter(
                  (sd) =>
                    sd.date.getUTCDate() +
                      "-" +
                      String(sd.date.getUTCMonth() + 1).padStart(2, "0") +
                      "-" +
                      sd.date.getUTCFullYear() ===
                    format(calendarDate, "d-MM-yyyy")
                ) ?? []
              }
              columns={columns}
            />
          </div>
        </div>
      </main>
      <NewScheduleGroup
        scheduleDate={calendarDate}
        dialog={visible}
        refetch={refetch}
        setDialog={setVisible}
        companyId={session.user.company_id}
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
export default Schedule;
