import { FieldHookConfig, useField } from "formik";

const RadiantTextArea = ({ ...props }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [field, meta] = useField(props as FieldHookConfig<any>);
  return (
    <div className="w-full">
      <label
        className="block uppercase tracking-wide text-gray-700 text-xs font-bold m-1"
        htmlFor={props.id || props.name}
      >
        {props.label}
      </label>
      <textarea
        style={{ margin: 0 }}
        className={`w-full p-2.5 shadow bg-gray-50 border border-gray-300 text-gray-700 text-sm focus:outline-gray-700 hover:bg-gray-200 rounded-sm ${
          meta.touched && meta.error && "border-red-500"
        }`}
        {...field}
        {...props}
      />
      {meta.touched && meta.error ? (
        <p className="text-red-500 text-xs italic">{meta.error}</p>
      ) : null}
    </div>
  );
};
export default RadiantTextArea;
