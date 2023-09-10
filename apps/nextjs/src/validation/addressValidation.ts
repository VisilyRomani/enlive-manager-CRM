import * as Yup from "yup";

export const addressValidaiton = Yup.object().shape({
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
});
