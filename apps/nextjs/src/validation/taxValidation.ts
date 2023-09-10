import * as Yup from "yup";

export const taxValidation = Yup.object().shape({
  name: Yup.string().required("Tax must have a name"),
  percent: Yup.number()
    .integer("Tax must be a whole number")
    .positive()
    .max(100)
    .required("Tax must have percent"),
});
