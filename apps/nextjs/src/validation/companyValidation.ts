import * as Yup from "yup";

export const companyValidation = Yup.object().shape({
  company_name: Yup.string().required("Company must have a company name"),
  address: Yup.string().required("Address is required to register a Company"),
  email: Yup.string().required("Email is required to register a Company"),
  number: Yup.string()
    .test(
      "isPhone",
      "Must enter 10 digit number",
      (value) => !value?.includes("_")
    )
    .required("Phone number is requred to register company"),
});

export const companyConnectValidation = Yup.object().shape({
  company_code: Yup.string().required("Company id is a required field"),
});
