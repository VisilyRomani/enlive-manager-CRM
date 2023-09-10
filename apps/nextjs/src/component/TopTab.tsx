import { Dispatch, SetStateAction } from "react";

interface ITab {
  setTab: Dispatch<SetStateAction<number>>;
  tab: number;
  tabLabel: string[];
}
export const TopTab = ({ setTab, tabLabel, tab }: ITab) => (
  <ul className="mt-5 flex list-none flex-row flex-wrap border-b-0 pl-0 ">
    {tabLabel.map((label, idx) => {
      return (
        <li
          key={idx}
          className={`cursor-pointer my-2 block border-x-0 border-b-2 border-t-0 border-transparent px-7 pb-3.5 pt-4a text-xs font-bold uppercase leding-tight  ${
            tab === idx ? "text-violet-400 border-violet-800" : "text-gray-800"
          }`}
          onClick={() => setTab(idx)}
        >
          {label}
        </li>
      );
    })}
  </ul>
);
