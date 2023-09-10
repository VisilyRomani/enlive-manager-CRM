import * as Yup from "yup";

export const newJobValidation = Yup.object().shape({
  client: Yup.object({
    label: Yup.string(),
    value: Yup.string().required("Client is required"),
  }),
  address: Yup.object({
    label: Yup.string(),
    value: Yup.string().required("Address is required"),
  })
    .nullable()
    .required("Address is required"),
  task_list: Yup.array().min(1, "Must have at least 1 task"),
  company_id: Yup.string().required(),
});

export const addTaskValidation = Yup.object().shape({
  job_id: Yup.string().required(),
  task: Yup.object().required("Must select a task"),
  price: Yup.string().required("A task must have an assigned price"),
  quantity: Yup.number().integer().positive().min(1),
});
