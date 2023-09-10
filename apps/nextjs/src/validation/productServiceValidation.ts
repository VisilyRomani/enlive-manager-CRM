import * as Yup from "yup";

export const productServiceValidation = Yup.object().shape({
  name: Yup.string().required("Product or service must have name"),
  tax: Yup.array().min(1, "Tax must have at least 1 item"),
});
