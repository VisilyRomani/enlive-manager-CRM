import * as Yup from "yup";

export const NewStockValidation = Yup.object().shape({
  company_code: Yup.string(),
  name: Yup.string().required("Product name is required"),
  manufacturer: Yup.string().required("Product manufacturer is required"),
  order_link: Yup.string().optional(),
  quantity: Yup.number().integer().moreThan(0).required(),
});
