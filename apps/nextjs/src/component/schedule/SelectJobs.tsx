import { animated, useSpring } from "@react-spring/web";
import { useDrag, useGesture } from "@use-gesture/react";
import addMinutes from "date-fns/addMinutes";
import format from "date-fns/format";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { ColumnWithLooseAccessor } from "react-table";
import { IScheduledJobs, TIME_WIDTH } from "../../modal/NewScheduleGroup";
import { TIME_LIST } from "../../utils/util";
import ReusableTable from "../ReusableTable";
import RadiantButton from "../input/RadiantButton";
import Link from "next/link";

interface ISelectJobs {
  setScheduledJobs: Dispatch<SetStateAction<IScheduledJobs[]>>;
  scheduledJobs: IScheduledJobs[];
  data: IJobData[];
  scheduleDate: Date;
}

interface IJobData {
  job_id: string;
  address: string;
  client_name: string;
  job_task: string[];
  job_number: number;
  estimated_time: number | null;
  estimated_start_time: Date | null;
  estimated_end_time: Date | null;
}

const SelectJobs = ({
  setScheduledJobs,
  scheduledJobs,
  data,
  scheduleDate,
}: ISelectJobs) => {
  const JobList = ({
    scheduledJobs,
    data,
  }: {
    scheduledJobs: IScheduledJobs[];
    data: {
      job_id: string;
      address: string;
      client_name: string;
      job_task: string[];
      job_number: number;
    }[];
  }) => {
    const columns: ColumnWithLooseAccessor[] = [
      {
        Header: "",
        accessor: "job_id",
        Cell: ({
          cell: {
            row: { original },
          },
        }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any) => {
          const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
          const bind = useGesture({
            onDrag: ({ down, movement: [mx, my] }) => {
              api.start({
                x: down ? mx : 0,
                y: down ? my : 0,
                immediate: down,
              });
            },
            onDragEnd: ({ args: [originalIndex], xy }) => {
              const elem = document
                .elementsFromPoint(xy[0], xy[1])
                .find((e) => e.id === "time-sheet-drop") as HTMLDivElement;

              const scrollItem = document?.getElementById("overflowscroll-id");
              if (scrollItem) {
                sessionStorage.setItem(
                  "scrollPosition",
                  scrollItem.scrollLeft.toString()
                );
              }

              if (elem) {
                const startTime = new Date(
                  addMinutes(
                    new Date(new Date(scheduleDate).setHours(8)).setMinutes(0),
                    Math.trunc(
                      (roundTo15(
                        xy[0] - elem.offsetLeft + (scrollItem?.scrollLeft ?? 0)
                      ) /
                        TIME_WIDTH) *
                        12 *
                        60
                    )
                  )
                );

                setScheduledJobs([
                  ...scheduledJobs,
                  {
                    ...originalIndex,
                    estimated_start_time: startTime,
                    estimated_end_time: new Date(
                      addMinutes(startTime, originalIndex.estimated_time)
                    ),
                    x: roundTo15(
                      xy[0] - elem.offsetLeft + (scrollItem?.scrollLeft ?? 0)
                    ),
                  },
                ]);
              }
            },
          });

          return !scheduledJobs.find((j) => j.job_id === original.job_id) ? (
            <animated.div
              className="shadow w-fit p-2"
              {...bind(original)}
              style={{ x, y, touchAction: "none" }}
            >
              <RxHamburgerMenu size={30} className="hover:text-gray-900 " />
            </animated.div>
          ) : (
            <div className="h-[50px]"></div>
          );
        },
      },
      { Header: "Job Number", accessor: "job_number" },
      { Header: "Client Name", accessor: "client_name" },
      { Header: "Address", accessor: "address" },
      { Header: "Status", accessor: "status" },
      {
        Header: "Tasks",
        accessor: "job_task",
        Cell: ({ value }: { value: string[] }) => {
          return (
            <div>
              {value?.map((job_name, i) => {
                return <p key={i}>{job_name}</p>;
              })}
            </div>
          );
        },
      },
      {
        Header: "Job Information",
        accessor: "job_id",
        id: "id",
        Cell: ({ cell: { value } }: { cell: { value: string } }) => {
          return (
            <div>
              <Link href={`/admin/job/${value}`}>
                <a>
                  <RadiantButton>Job Information</RadiantButton>
                </a>
              </Link>
            </div>
          );
        },
      },
    ];

    return <ReusableTable columns={columns} data={data} name="Jobs" />;
  };

  const TimeBlock = ({
    job,
    conflict,
  }: {
    job: IScheduledJobs;
    conflict: boolean;
  }) => {
    const [props, api] = useSpring(() => ({
      x: job.x,
      y: 0,
      width: (job.estimated_time / 60) * 180,
      height: 60,
    }));
    const sizeRef = useRef<HTMLDivElement | null>(null);
    const bind = useDrag(
      ({ args: [originalIndex], ...state }) => {
        const isResize = state?.event.target === sizeRef.current;

        if (isResize) {
          api.start({
            width: roundTo15(state.offset[0]),
            height: props.height.get(),
          });
        } else {
          api.start({
            x: roundTo15(state.offset[0]),
            y: state.offset[1],
          });
        }

        if (!state.down) {
          const scrollItem = document?.getElementById("overflowscroll-id");
          if (scrollItem) {
            sessionStorage.setItem(
              "scrollPosition",
              scrollItem.scrollLeft.toString()
            );
          }

          const elem = document.elementsFromPoint(state.xy[0], state.xy[1]);

          if (!elem.find((e) => e.id === "time-sheet-drop")) {
            setScheduledJobs([
              ...scheduledJobs.filter((j) => originalIndex.job_id !== j.job_id),
            ]);
          } else {
            const startTime = new Date(
              addMinutes(
                new Date(
                  new Date(originalIndex.estimated_start_time).setHours(8)
                ).setMinutes(0),
                Math.trunc(
                  state.offset[0]
                    ? (roundTo15(state.offset[0]) / TIME_WIDTH) * 12 * 60
                    : 0
                )
              )
            );
            const caluclatedMinutes = (roundTo15(props.width.get()) / 180) * 60;

            setScheduledJobs(
              scheduledJobs.map((j) => {
                if (j.job_id === originalIndex.job_id) {
                  return {
                    ...j,
                    estimated_start_time: isResize
                      ? originalIndex.estimated_start_time
                      : startTime,
                    estimated_end_time: isResize
                      ? new Date(
                          addMinutes(
                            originalIndex.estimated_start_time,
                            caluclatedMinutes
                          )
                        )
                      : new Date(addMinutes(startTime, caluclatedMinutes)),
                    x: isResize ? originalIndex.x : roundTo15(state.offset[0]),
                    estimated_time: caluclatedMinutes,
                  };
                } else {
                  return j;
                }
              })
            );
          }
        }
      },
      {
        filterTaps: true,
        preventDefault: true,
        from: (event) => {
          const isResize = event.target === sizeRef.current;

          if (isResize) {
            return [props.width.get(), props.height.get()];
          } else {
            return [props.x.get(), 0];
          }
        },
        bounds: () => {
          return { top: 0, left: 0, right: TIME_WIDTH };
        },
      }
    );

    return (
      <animated.div
        {...bind(job)}
        style={{
          ...props,
        }}
        className={`shadow h-full flex touch-pan-x ${
          conflict ? "bg-red-100" : "bg-green-100"
        } flex-row gap-3 absolute`}
      >
        <div className="flex flex-row text-sm justify-between w-full select-none">
          <div className="flex flex-col p-1">
            <div className={`font-bold cursor-move`}>Job: {job.job_number}</div>
            <div className={`font-bold cursor-move`}>
              {format(job.estimated_start_time, "h:mm")}-
              {format(job.estimated_end_time, "h:mm")}
            </div>
          </div>
          <div
            className="w-3 hover:bg-green-300 float-right"
            ref={sizeRef}
          ></div>
        </div>
      </animated.div>
    );
  };

  const TimeSheet = ({
    sheetDate,
    jobs,
  }: {
    sheetDate: Date;
    jobs: IScheduledJobs[];
  }) => {
    useEffect(() => {
      const scrollItem = document?.getElementById("overflowscroll-id");
      const scrollPosition = sessionStorage.getItem("scrollPosition");
      if (scrollPosition && scrollItem) {
        scrollItem.scrollTo(parseInt(scrollPosition), 0);
      }
    }, [jobs]);

    return (
      <div className="flex flex-row">
        <div className="border items-center flex font-bold p-3">
          {format(sheetDate, "MMM-dd") || "no Date"}
        </div>
        <div className="overflow-x-scroll touch-pan-x" id="overflowscroll-id">
          <ul className="grid grid-cols-[repeat(25,minmax(90px,1fr))]">
            {TIME_LIST.map((time) => {
              return (
                <li
                  className="flex flex-col justify-between items-center border"
                  key={time.value}
                >
                  <p className="whitespace-nowrap text-center">{time.label}</p>
                </li>
              );
            })}
          </ul>
          <div className="w-[2250px] h-16 relative" id="time-sheet-drop">
            {jobs.map((j) => {
              return (
                <TimeBlock
                  key={`${"block-" + j.job_id}`}
                  job={j}
                  conflict={isTimeConflict(jobs, j)}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <TimeSheet sheetDate={scheduleDate} jobs={scheduledJobs} />
      <JobList data={data} scheduledJobs={scheduledJobs} />
    </>
  );
};

export const isTimeConflict = (
  list: IScheduledJobs[],
  item: IScheduledJobs
) => {
  return !!list.find(
    (job) =>
      (job.estimated_start_time < item.estimated_start_time &&
        item.estimated_start_time < job.estimated_end_time) ||
      (item.estimated_end_time > job.estimated_start_time &&
        item.estimated_end_time < job.estimated_end_time) ||
      (item.estimated_start_time.toISOString() ===
        job.estimated_start_time.toISOString() &&
        item.job_id !== job.job_id)
  );
};

const roundTo15 = (px: number) => {
  return Math.round(px / 45) * 45;
};

export default SelectJobs;
