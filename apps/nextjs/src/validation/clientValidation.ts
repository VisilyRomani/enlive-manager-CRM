import * as Yup from "yup";

export const clientValidation = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  address: Yup.string().required("Address is required"),
  phone_number: Yup.string()
    .test(
      "isPhone",
      "Must enter 10 digit number",
      (value) => !value?.includes("_")
    )
    .notRequired(),
  mobile_number: Yup.string()
    .test(
      "isPhone",
      "Must enter 10 digit number",
      (value) => !value?.includes("_")
    )
    .notRequired(),
  fax: Yup.string()
    .test(
      "isPhone",
      "Must enter 10 digit number",
      (value) => !value?.includes("_")
    )
    .notRequired(),
  city: Yup.string().required("City is required"),
  email: Yup.string().email().notRequired(),
  platform: Yup.object().shape({
    label: Yup.string().required(),
    value: Yup.string().required("Platform is required"),
  }),
  company_id: Yup.string().required(),
});

export const editClientValidation = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  email: Yup.string().email().notRequired(),
  phone_number: Yup.string()
    .test(
      "isPhone",
      "Must enter 10 digit number",
      (value) => !value?.includes("_")
    )
    .notRequired(),
  mobile_number: Yup.string()
    .test(
      "isPhone",
      "Must enter 10 digit number",
      (value) => !value?.includes("_")
    )
    .notRequired(),
  fax: Yup.string()
    .test(
      "isPhone",
      "Must enter 10 digit number",
      (value) => !value?.includes("_")
    )
    .notRequired(),
});
