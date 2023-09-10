import { ButtonHTMLAttributes } from "react";

const RadiantButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={`uppercase active:bg-gray-300 active:border-gray-400 shadow bg-gray-50 border border-gray-300 text-gray-700 text-sm focus:outline-gray-700 hover:bg-gray-200 whitespace-nowrap rounded-sm py-2 px-4 disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-inner + ${props.className}`}
    >
      {props.children}
    </button>
  );
};
export default RadiantButton;
