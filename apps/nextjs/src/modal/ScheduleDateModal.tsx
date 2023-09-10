import { IModalProps } from "../types/modal";
import RadiantButton from "../component/input/RadiantButton";
import Calendar from "../component/Calendar";
import { useState } from "react";
import { IScheduledJobs } from "./NewScheduleGroup";
import { trpc } from "../utils/trpc";
import { toast } from "react-toastify";
import Modal from "../component/Modal";

const ScheduleDateModal = ({
  dialog,
  setDialog,
  data,
  refetch,
}: IModalProps & {
  data: { scheduleDate: Date; scheduleId: string; jobs: IScheduledJobs[] };
}) => {
  const [calendar, setCalendar] = useState(data.scheduleDate);
  const updateScheduleDate = trpc.schdule.updateDate.useMutation();

  return (
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      <div className="flex flex-col gap-3 ">
        <h1 className="text-gray-700 text-4xl font-bold mt-0 mb-6 text-center">
          Change Date
        </h1>
        <Calendar date={calendar} selectedDate={setCalendar} />
        <div className="flex flex-row w-full justify-between">
          <RadiantButton
            onClick={() => {
              setCalendar(data.scheduleDate);
              setDialog(false);
            }}
          >
            Close
          </RadiantButton>
          <RadiantButton
            onClick={() => {
              updateScheduleDate.mutate(
                {
                  scheduleDate: calendar,
                  scheduleId: data.scheduleId,
                  data: data.jobs,
                },
                {
                  onSuccess: () => {
                    toast.success("Updated date!");
                    !!refetch && refetch();
                    setDialog(false);
                  },
                  onError: () => {
                    toast.error("Updating date failed!");
                    !!refetch && refetch();
                  },
                }
              );

              //   setCalendar(data.scheduleDate);
            }}
          >
            Save
          </RadiantButton>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleDateModal;
