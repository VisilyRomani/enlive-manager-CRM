import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { trpc } from "../../../utils/trpc";
import { useRef } from "react";
import format from "date-fns/format";
import { useRouter } from "next/router";
import { FaChevronRight } from "react-icons/fa";
import { AppHeader } from "../../../component/AppHeader";

const JobGroup = ({ session }: { session: Session }) => {
  const now = useRef(format(new Date(), "yyyy-MM-dd"));
  const router = useRouter();
  const { data } = trpc.schdule.getScheduleByDay.useQuery({
    company_id: session.user.company_id ?? "",
    user_id: session.user.id ?? "",
    date: now.current,
  });

  const JobCard = ({
    workers,
    schedule_name,
    jobs,
    schedule_id,
  }: {
    workers: string[];
    schedule_name: string;
    jobs: number;
    schedule_id: string;
  }) => {
    return (
      <div className="mb-3 bg-white shadow">
        <div
          className="p-3"
          onClick={() => {
            router.push({
              pathname: "/app/job-group/[id]",
              query: { id: schedule_id },
            });
          }}
        >
          <h1 className="text-gray-700 text-center text-2xl font-bold">
            {schedule_name}
          </h1>
          <div className="flex flex-row justify-between items-center">
            <div>
              Jobs: {jobs}
              <div>
                Assigned To:
                {workers.map((w, index) => (
                  <div key={index}>
                    <p className="pl-5">{w}</p>
                  </div>
                ))}
              </div>
            </div>
            <FaChevronRight name="chevron-right" size={30} color="#374151" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="h-full bg-slate-100">
      <AppHeader title={"Schedule"} back={false} />
      <div className="w-full h-full">
        {!data?.length && (
          <p className="text-center pt-3 text-gray-500">No Available Jobs</p>
        )}

        {data?.map(
          ({ job_details, user_schedule, schedule_id, schedule_name }, idx) => {
            return (
              <JobCard
                key={idx}
                schedule_id={schedule_id}
                schedule_name={schedule_name}
                workers={user_schedule.map((us) => us.user.name ?? "")}
                jobs={job_details}
              />
            );
          }
        )}
      </div>
    </main>
  );
};
export default JobGroup;

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
  } else if (!session?.user?.company_id) {
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
