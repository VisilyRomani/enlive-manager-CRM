import { IModalProps } from "../types/modal";
import Modal from "../component/Modal";
import RadiantButton from "../component/input/RadiantButton";
import { trpc } from "../utils/trpc";
import { useEffect, useState } from "react";
import SelectJobs, { isTimeConflict } from "../component/schedule/SelectJobs";
import SelectWorkers from "../component/schedule/SelectWorkers";
import { toast } from "react-toastify";
import { capitalizeWord } from "../utils/util";

export const TIME_WIDTH = 90 * 24;

export interface IScheduledJobs {
  type: "Existing" | "New";
  estimated_start_time: Date;
  estimated_end_time: Date;
  estimated_time: number;
  status: string;
  job_id: string;
  job_number: number;
  x: number;
}

const NewScheduleGroup = ({
  dialog,
  setDialog,
  refetch,
  companyId,
  scheduleDate,
}: IModalProps & { scheduleDate: Date; companyId: string }) => {
  const jobs = trpc.job.availableJobs.useQuery({ company_id: companyId });
  const createGroup = trpc.schdule.create.useMutation();
  const { data: workers } = trpc.user.allScheduleUsers.useQuery(companyId);

  const [scheduleName, setScheduleName] = useState("");
  const [scheduledJobs, setScheduledJobs] = useState<IScheduledJobs[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    setScheduledJobs([]);
    setSelectedWorkers([]);
    setIndex(0);
  }, [dialog]);

  const handleNext = () => {
    switch (index) {
      case 0:
        const isConflict = !scheduledJobs.find((sj) => {
          return isTimeConflict(scheduledJobs, sj);
        });

        if (scheduledJobs.length && isConflict) {
          setIndex(index + 1);
        }
        break;

      case 1:
        if (selectedWorkers.length && scheduleName) {
          submitGroup();
        }
        break;
      default:
        setIndex(0);
    }
  };
  const submitGroup = () => {
    createGroup.mutate(
      {
        company_id: companyId,
        job_details: scheduledJobs,
        workers: selectedWorkers,
        schedule_name: capitalizeWord(scheduleName),
        scheduleDate: scheduleDate,
      },
      {
        onError: () => {
          toast.error("Failed to create schedule");
        },
        onSuccess: () => {
          toast.success("Schedule created successfully");
          refetch && refetch();
        },
        onSettled: () => {
          setDialog(false);
        },
      }
    );
  };

  return (
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      <div className="flex flex-col gap-3 select-none">
        <h1 className="text-gray-700 text-center text-3xl font-bold">
          TimeSheet
        </h1>
        {index === 0 && (
          <SelectJobs
            data={jobs.data ?? []}
            scheduledJobs={scheduledJobs}
            setScheduledJobs={setScheduledJobs}
            scheduleDate={scheduleDate}
          />
        )}
        {index === 1 && (
          <SelectWorkers
            workers={workers || []}
            selectedWorkers={selectedWorkers}
            setSelectedWorkers={setSelectedWorkers}
            setScheduleName={setScheduleName}
          />
        )}
        <div className="flex flex-row justify-between">
          <RadiantButton type="button" onClick={() => setDialog(false)}>
            Close
          </RadiantButton>
          <RadiantButton type="button" onClick={handleNext}>
            Next
          </RadiantButton>
        </div>
      </div>
    </Modal>
  );
};

export default NewScheduleGroup;
