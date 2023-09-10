const RadiantCheck = ({ ...props }) => {
  return (
    <>
      <div className="flex flex-row w-fit">
        <input
          type="checkbox"
          className="bg-gray-50 mr-2 border border-gray-300 text-gray-700 text-sm focus:outline-gray-700 hover:bg-gray-200  rounded-sm w-25 p-2.5"
          {...props}
        />
        <label
          className="flex items-center uppercase whitespace-nowrap tracking-wide text-gray-700 text-xs font-bold"
          htmlFor={props.id || props.name}
        >
          {props.label}
        </label>
      </div>
    </>
  );
};
export default RadiantCheck;
