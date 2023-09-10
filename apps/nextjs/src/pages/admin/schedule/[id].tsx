import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { isNotAdmin } from "../../../utils/util";
import { trpc } from "../../../utils/trpc";
import { useRouter } from "next/router";
import SelectJobs from "../../../component/schedule/SelectJobs";
import { useEffect, useState } from "react";
import { IScheduledJobs } from "../../../modal/NewScheduleGroup";
import addMinutes from "date-fns/addMinutes";
import { Session } from "next-auth";
import RadiantButton from "../../../component/input/RadiantButton";
import differenceInMinutes from "date-fns/differenceInMinutes";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import Head from "next/head";
import { toast } from "react-toastify";
import { BsCalendar2Date } from "react-icons/bs";
import ScheduleDateModal from "../../../modal/ScheduleDateModal";

const ScheduleInformation = ({ session }: { session: Session }) => {
  const router = useRouter();

  const id = router.query.id as string;
  const company_id = session.user.company_id;
  const [selected, setSelected] = useState<IScheduledJobs[]>([]);
  const [dialog, setDialog] = useState(false);

  const { data: jobs, refetch: refetchJobs } = trpc.job.availableJobs.useQuery({
    company_id,
    schedule_id: id,
  });
  const { data: scheduleData, refetch: refetchSchedule } =
    trpc.schdule.getScheduleById.useQuery(id);
  const updateScheudle = trpc.schdule.updateSchedule.useMutation();

  useEffect(() => {
    if (scheduleData?.job_details) {
      setSelected(
        scheduleData.job_details
          .filter((j) => !!j.estimated_start_time)
          .map((d) => {
            return {
              ...d,
              x:
                (differenceInMinutes(
                  d.estimated_start_time ?? new Date(),
                  setMinutes(
                    setHours(d.estimated_start_time ?? new Date(), 8),
                    0
                  )
                ) /
                  15) *
                45,
              type: "Existing",
              estimated_start_time: d.estimated_start_time ?? new Date(),
              estimated_end_time: d.estimated_end_time ?? new Date(),
              estimated_time: d.estimated_time ?? 60,
            };
          })
      );
    }
  }, [scheduleData, setSelected]);

  if (!scheduleData?.date) {
    return <div>Error missing Date</div>;
  }

  const reloadSchedule = () => {
    refetchJobs();
    refetchSchedule();
  };

  return (
    <main className="shadow flex flex-col flex-grow w-fill m-3 overflow-auto">
      <Head>
        <title>Schedule</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-gray-700 text-center text-4xl font-bold">
        {scheduleData.schedule_name}
      </h1>
      <div className="w-full flex flex-row-reverse gap-3 p-3">
        <RadiantButton
          onClick={() => {
            updateScheudle.mutate(
              {
                addJob: selected,
                schedule_id: id,
                removeJob:
                  jobs
                    ?.filter((j) => {
                      return !selected.find((s) => s.job_id === j.job_id);
                    })
                    .map((j) => j.job_id) ?? [],
              },
              {
                onSuccess: () => {
                  toast.success("Updated scheudle!");
                  reloadSchedule();
                },
                onError: () => {
                  toast.error("failed to updated scheudle!");
                  reloadSchedule();
                },
              }
            );
          }}
        >
          Update Scheudle
        </RadiantButton>
        <RadiantButton onClick={() => setDialog(!dialog)}>
          <BsCalendar2Date />
        </RadiantButton>
      </div>
      <div className="overflow-auto w-full">
        <SelectJobs
          scheduledJobs={selected}
          setScheduledJobs={setSelected}
          scheduleDate={addMinutes(
            scheduleData.date,
            new Date().getTimezoneOffset()
          )}
          data={jobs ?? []}
        />
      </div>
      <ScheduleDateModal
        dialog={dialog}
        setDialog={setDialog}
        data={{
          scheduleDate: addMinutes(
            scheduleData.date,
            new Date().getTimezoneOffset()
          ),
          scheduleId: id,
          jobs: selected,
        }}
        refetch={reloadSchedule}
      />
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
export default ScheduleInformation;
