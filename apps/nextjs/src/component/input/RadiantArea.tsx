const RadiantArea = ({ ...props }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <label
        className="flex items-center uppercase whitespace-nowrap tracking-wide text-gray-700 text-xs font-bold"
        htmlFor={props.id || props.name}
      >
        {props.label}
      </label>
      <textarea
        className={
          "w-full h-full shadow bg-gray-50 border border-gray-300 text-gray-700 text-sm focus:outline-gray-700 hover:bg-gray-200 rounded-sm" +
          props.className
        }
        {...props}
      />
    </div>
  );
};
export default RadiantArea;
