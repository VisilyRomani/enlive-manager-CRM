import { BsTrash } from "react-icons/bs";
import { ColumnWithLooseAccessor } from "react-table";
import { IJobTask } from "../modal/NewJobModal";
import { trpc } from "../utils/trpc";
import ReusableTable from "./ReusableTable";

interface ICreateJobTask {
  type: "CREATE";
  job_data: IJobTask[];
  setFieldValue: (
    field: string,
    value: IJobTask[],
    shouldValidate?: boolean | undefined
  ) => void;
}

interface IEditJobTask {
  type: "EDIT";
  job_data: IJobTask[];
  refetch: () => void;
}

const JobTasks = (props: ICreateJobTask | IEditJobTask) => {
  const removeTask = trpc.task.remove.useMutation();
  const columns: ColumnWithLooseAccessor[] = [
    { Header: "Name", accessor: "job_name" },
    {
      Header: "Price",
      accessor: "price",
      Cell: ({ cell: { value: price } }: { cell: { value: string } }) => (
        <p>${price}</p>
      ),
    },
    { Header: "Quantity", accessor: "quantity" },

    {
      Header: "remove",
      accessor: "job_task_id",
      Cell: ({ cell: { value: job_task_id } }: { cell: { value: string } }) => {
        return (
          <div
            className="py-2 px-6 justify-center flex"
            onClick={() => {
              if (props.type === "CREATE") {
                props.setFieldValue(
                  "task_list",
                  props.job_data.filter((t) => t.job_task_id != job_task_id)
                );
              } else {
                removeTask.mutate(job_task_id, {
                  onSuccess: () => {
                    props.refetch();
                  },
                });
              }
            }}
          >
            <BsTrash size={20} className="hover:text-gray-900" />
          </div>
        );
      },
    },
  ];

  return (
    <ReusableTable columns={columns} data={props.job_data} name={"Job Tasks"} />
  );
};

export default JobTasks;
