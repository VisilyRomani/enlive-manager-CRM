import * as Yup from "yup";

export const paymentValidation = Yup.object().shape({
  amount: Yup.number().positive().min(0),
  type: Yup.string().required("A type must be selected"),
  reference_code: Yup.string().when(["type"], (type, schema) => {
    return type === "ETRANSFER"
      ? schema.required("A E-transfer must have refernce code")
      : schema;
  }),
});
