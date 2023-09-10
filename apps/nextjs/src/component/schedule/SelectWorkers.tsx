import { ChangeEvent, Dispatch, SetStateAction } from "react";
import RadiantCheck from "../input/RadiantCheck";
import RadiantInput from "../input/RadiantInput";

interface ISelectWorkers {
  workers: {
    id: string;
    name: string | null;
  }[];
  setScheduleName: Dispatch<SetStateAction<string>>;
  setSelectedWorkers: Dispatch<SetStateAction<string[]>>;
  selectedWorkers: string[];
}
const SelectWorkers = ({
  workers,
  setSelectedWorkers,
  setScheduleName,
  selectedWorkers,
}: ISelectWorkers) => {
  return (
    <div>
      <div>
        <RadiantInput
          label="Schedule Label"
          onChange={(e) => setScheduleName(e.target.value)}
        />
      </div>
      <h1 className="text-gray-700 text-center text-2xl font-bold">Workers</h1>
      {workers.map((w, i) => {
        return (
          <div key={i} className="flex flex-row justify-between">
            {w.name}
            <RadiantCheck
              defaultChecked={selectedWorkers.find((id) => id === w.id)}
              value={selectedWorkers.find((id) => id === w.id)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.checked) {
                  setSelectedWorkers([...selectedWorkers, w.id]);
                } else {
                  setSelectedWorkers(
                    selectedWorkers.filter((sw) => sw !== w.id)
                  );
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SelectWorkers;
