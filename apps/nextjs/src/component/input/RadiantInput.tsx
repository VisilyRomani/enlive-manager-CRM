import { ClassAttributes, InputHTMLAttributes } from "react";

const RadiantInput = (
  props: JSX.IntrinsicAttributes &
    ClassAttributes<HTMLInputElement> &
    InputHTMLAttributes<HTMLInputElement> & { label?: string }
) => {
  return (
    <div className={`${!props?.label ? "w-fit" : "w-full"}`}>
      {!!props?.label && (
        <label
          className="uppercase tracking-wide text-gray-700 text-xs font-bold m-1"
          htmlFor={props.id || props.name}
        >
          {props.label}
        </label>
      )}
      <input
        className={`shadow ${
          props.type !== "checkbox" ? "w-full" : ""
        } bg-gray-50 border border-gray-300 text-gray-700 text-sm focus:outline-gray-700 hover:bg-gray-200 rounded-sm p-2.5 disabled:bg-gray-200`}
        {...props}
      />
    </div>
  );
};
export default RadiantInput;
