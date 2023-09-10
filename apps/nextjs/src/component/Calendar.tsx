import React, { FC } from "react";
import format from "date-fns/format";
import getYear from "date-fns/getYear";
import cuid from "cuid";
import {
  addDays,
  addMinutes,
  addMonths,
  isSameDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import RadiantButton from "./input/RadiantButton";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai/";

interface Calendar {
  selectedDate: React.Dispatch<React.SetStateAction<Date>>;
  data?: {
    date: Date;
    completed: boolean;
  }[];
  date: Date;
}

const Calendar: FC<Calendar> = ({ selectedDate, date, data }) => {
  const weekDays: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const startCalender: Date = subDays(
    startOfMonth(date),
    parseInt(format(startOfMonth(date), "ee")) - 1
  );

  const calender: Date[] = [...Array(42)].map((_n, index) =>
    addDays(startCalender, index)
  );

  const dayHandler = (day: Date) => {
    selectedDate(day);
  };

  return (
    <div className="flex flex-col justify-center items-stretch flex-shrink-0 shadow gap-3">
      <div className="flex justify-between">
        <RadiantButton
          type="button"
          onClick={() => selectedDate(subMonths(date, 1))}
        >
          <AiOutlineLeft />
        </RadiantButton>
        <h1 className="text-gray-700 text-center text-3xl font-bold">
          {format(date, "LLLL")} {getYear(date)}
        </h1>
        <RadiantButton
          type="button"
          onClick={() => selectedDate(addMonths(date, 1))}
        >
          <AiOutlineRight />
        </RadiantButton>
      </div>

      <div className="grid grid-cols-7 justify-between items-center flex-row">
        {weekDays.map((day) => {
          return (
            <div className="flex items-center flex-col" key={cuid()}>
              <p>{day}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7">
        {calender.map((day) => {
          const filterJobs = data?.filter((d) => {
            return isSameDay(
              addMinutes(d.date, new Date().getTimezoneOffset()),
              day
            );
          });
          const Incomplete = filterJobs?.find((j) => !j.completed);
          return (
            <div
              key={cuid()}
              className={`${
                isSameDay(date, day)
                  ? "bg-violet-200"
                  : isSameDay(Date.now(), day)
                  ? "bg-slate-200"
                  : "bg-slate-50"
              } p-1 m-[1px] h-12 min-w-[50px]`}
              onClick={() => dayHandler(day)}
            >
              <p>{format(day, "d")}</p>
              <div className="flex ">
                {!!filterJobs?.length && (
                  <span
                    className={`rounded-full inline-block w-[10px] h-[10px]  ${
                      Incomplete ? "bg-red-500" : "bg-green-500"
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Calendar;
