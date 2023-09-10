import * as Yup from "yup";

export const updateCreateInvoiceTemplateValdation = Yup.object().shape({
  company_code: Yup.string(),
  invoice_template_id: Yup.string(),
  gst: Yup.string(),
  pst: Yup.string(),
  address: Yup.string().required(),
  city: Yup.string().required(),
  phone: Yup.string(),
  email: Yup.string(),
  link: Yup.string(),
});
