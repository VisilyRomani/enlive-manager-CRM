import Select, { GroupBase, Props } from "react-select";

function RadiantSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: Props<Option, IsMulti, Group> & { label?: string }) {
  const windowTest = () => {
    if (typeof window !== "undefined") {
      if (
        !!(window.document.getElementsByClassName(
          "modal-base"
        )[0] as HTMLElement)
      ) {
        return window.document.getElementsByClassName(
          "modal-base"
        )[0] as HTMLElement;
      } else {
        return window.document.body;
      }
    } else {
      null;
    }
  };

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
      <Select
        {...props}
        menuPlacement="auto"
        menuPosition="fixed"
        menuPortalTarget={windowTest()}
        styles={{
          container: (baseStyles) => ({
            ...baseStyles,
            width: "100%",
            whiteSpace: "nowrap",
          }),
          control: (baseStyles) => ({
            ...baseStyles,
            fontSize: "0.875rem",
            width: "100%",
            lineHeight: "1.25rem",
            backgroundColor: "#fafafa",
            borderRadius: "0.125rem",
            height: "41.6px",
            position: "relative",
            boxShadow:
              "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          }),
          placeholder: (baseStyles) => ({
            ...baseStyles,
            color: "#9ca3af",
          }),
          menuList: (baseStyles) => ({
            ...baseStyles,
            width: "100%",
            position: "relative",
            zIndex: "1 !important",
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        theme={(theme) => ({ ...theme, borderRadius: 0 })}
      />
    </div>
  );
}
export default RadiantSelect;
