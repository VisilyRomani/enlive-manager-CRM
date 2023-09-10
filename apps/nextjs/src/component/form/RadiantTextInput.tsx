import { FieldHookConfig, useField } from "formik";
import MaskedInput from "react-text-mask";

const RadiantTextInput = ({ ...props }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [field, meta] = useField(props as FieldHookConfig<any>);
  return (
    <div className="w-full">
      {!!props?.label && (
        <label
          className="uppercase tracking-wide text-gray-700 text-xs font-bold m-1 whitespace-nowrap"
          htmlFor={props.id || props.name}
        >
          {props.label}
        </label>
      )}
      {props?.mask ? (
        <MaskedInput
          {...field}
          {...props}
          type="text"
          className={`shadow w-full bg-gray-50 border border-gray-300 text-gray-700 text-sm focus:outline-gray-700 hover:bg-gray-200 rounded-sm p-2.5 ${
            meta.touched && meta.error && "border-red-500"
          }`}
          mask={props.mask}
        />
      ) : (
        <input
          type="text"
          className={`shadow w-full bg-gray-50 border border-gray-300 text-gray-700 text-sm focus:outline-gray-700 hover:bg-gray-200 rounded-sm p-2.5 disabled:bg-gray-200 ${
            meta.touched && meta.error && "border-red-500"
          }`}
          {...field}
          {...props}
        />
      )}
      {meta.touched && meta.error ? (
        <p className="text-red-500 text-xs italic">{meta.error}</p>
      ) : null}
    </div>
  );
};
export default RadiantTextInput;
