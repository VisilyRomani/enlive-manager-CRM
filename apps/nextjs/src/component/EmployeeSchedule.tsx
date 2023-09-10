import addDays from "date-fns/addDays";
import format from "date-fns/format";
import startOfWeek from "date-fns/startOfWeek";

interface UserScheudule {
  user_id: string;
  user_name: string;
  schedule: {
    date: Date;
    start: Date;
    end: Date;
  };
}
export const EmployeeSchedule = (users: UserScheudule[]) => {
  console.log(users);
  return (
    <div>
      {currentWeek(new Date()).map((day, idx) => {
        return <div key={idx}>{format(day, "d EE")}</div>;
      })}
    </div>
  );
};

const currentWeek = (date: Date) => {
  const week = [];
  for (let i = 0; i < 7; i++) {
    week.push(addDays(startOfWeek(date), i));
  }
  return week;
};
