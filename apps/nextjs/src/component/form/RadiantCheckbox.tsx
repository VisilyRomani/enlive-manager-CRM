import { FieldHookConfig, useField } from "formik";

const RadiantCheckBox = ({ ...props }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [field, meta] = useField(props as FieldHookConfig<any>);
  return (
    <>
      <div className="flex flex-row">
        <input
          type="checkbox"
          className="m-2 bg-gray-50 border border-gray-300 text-gray-700 text-sm focus:outline-gray-700 hover:bg-gray-200  rounded-sm w-25 p-2.5"
          {...field}
          {...props}
        />
        <label
          className=" flex items-center uppercase tracking-wide text-gray-700 text-xs font-bold"
          htmlFor={props.id || props.name}
        >
          {props.label}
        </label>
      </div>
      {meta.touched && meta.error ? (
        <p className="error">{meta.error}</p>
      ) : null}
    </>
  );
};
export default RadiantCheckBox;
