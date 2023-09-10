import { Form, Formik } from "formik";
import React from "react";
import Modal from "../component/Modal";
import { IModalProps } from "../types/modal";
import RadiantButton from "../component/input/RadiantButton";
import { trpc } from "../utils/trpc";
import { AppRouter } from "@acme/api";
import RadiantSelect from "../component/input/RadiantSelect";
import { toast } from "react-toastify";
import { newJobValidation } from "../validation/jobValidation";
import RadiantTextInput from "../component/form/RadiantTextInput";
import RadiantTextArea from "../component/form/RadiantTextArea";
import { StringToPriceint, numberMask } from "../utils/util";
import JobTasks from "../component/JobTasks";
import { Session } from "next-auth";
import cuid from "cuid";

export interface IJobTask {
  price: string;
  job_task_id: string;
  quantity: string;
  product_service_id: string;
}

const NewJobModal = ({
  session,
  dialog,
  setDialog,
  refetch,
}: IModalProps & { session: Session }) => {
  const createJob = trpc.job.create.useMutation();
  const { data: productService } =
    trpc.product_service.getProductService.useQuery(session.user.company_id);
  const productServiceOptions =
    productService?.map((ps) => {
      return { label: ps.name, value: ps.product_service_id };
    }) ?? [];

  const company_id = session.user.company_id;
  const { data: allClients = [] } =
    trpc.client.all.useQuery<AppRouter["client"]["all"]>(company_id);

  const selectData = allClients.map((client) => ({
    label: client.first_name + " " + (client?.last_name ?? ""),
    value: client.client_id,
  }));

  const selectAddress = allClients.flatMap((client) =>
    client.address.map((addr) => ({
      label: addr.address,
      value: addr.address_id,
      client_id: client.client_id,
    }))
  );

  const handleClose = () => {
    setDialog(false);
  };

  return (
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      <Formik
        enableReinitialize
        initialValues={{
          company_id: company_id,
          client: { label: "", value: "" },
          address: { label: "", value: "" },
          name: { label: "", value: "" },
          price: "",
          job_note: "",
          quantity: "1",
          task_list: [] as IJobTask[],
          estimated_time: "60",
        }}
        validationSchema={newJobValidation}
        onSubmit={(values) => {
          createJob.mutate(
            {
              address_id: values.address.value,
              job_note: values.job_note,
              estimated_time: parseInt(values.estimated_time),
              list_task: values.task_list.map((t) => ({
                ...t,
                price: StringToPriceint(t.price),
                quantity: Number(t.quantity),
              })),
              company_id: values.company_id,
            },
            {
              onSuccess: () => {
                !!refetch && refetch();
                toast.success("Successfully Created Job");
                handleClose();
              },
            }
          );
        }}
      >
        {({
          values,
          setFieldValue,
          errors,
          touched,
          handleBlur,
          setFieldError,
        }) => (
          <Form>
            <p className="text-2xl font-bold text-gray-600 text-center">
              Create New Job
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 m-2">
              <div className="flex flex-col justify-between">
                <div>
                  <RadiantSelect
                    onBlur={handleBlur}
                    label="Client"
                    classNames={{
                      container: () => "w-[196px]",
                    }}
                    name="client"
                    options={selectData}
                    onChange={(data) => {
                      setFieldValue("client", { ...data });
                      const address = selectAddress.filter(
                        (addr) => addr.client_id === data?.value
                      );
                      if (address.length === 1) {
                        setFieldValue("address", { ...address[0] });
                      } else {
                        setFieldValue("address", { label: "", value: "" });
                      }
                    }}
                  />
                  {!!errors.client?.value && !!touched.client?.value && (
                    <p className="text-red-500 text-xs italic">
                      {errors.client?.value}
                    </p>
                  )}
                </div>
                <div>
                  <RadiantSelect
                    label="Address"
                    onBlur={handleBlur}
                    classNames={{
                      container: () => "w-[196px]",
                    }}
                    name="address"
                    options={selectAddress.filter(
                      (addr) => addr.client_id === values.client.value
                    )}
                    value={!values.address.value ? null : values.address}
                    onChange={(data) => {
                      setFieldValue("address", data);
                    }}
                  />

                  {!!errors.address?.value && !!touched.address?.value && (
                    <p className="text-red-500 text-xs italic">
                      {errors.address?.value}
                    </p>
                  )}
                </div>

                <RadiantTextInput
                  name="estimated_time"
                  label="Estimated Time"
                  onChange={(data: { target: { value: number } }) =>
                    setFieldValue("estimated_time", data.target.value)
                  }
                />
                <RadiantTextArea name="job_note" label="Note" />
              </div>

              <div className="flex-col flex justify-between">
                <div className="overflow-auto h-64 shadow-inner">
                  <JobTasks
                    type="CREATE"
                    job_data={values.task_list}
                    setFieldValue={setFieldValue}
                  />
                </div>
                {errors.task_list ? (
                  <span className="text-red-500 text-xs italic flex justify-center m-1">
                    {errors.task_list as string}
                  </span>
                ) : null}
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <RadiantSelect
                        label="Task"
                        value={values.name}
                        options={productServiceOptions ?? []}
                        onChange={(task) => setFieldValue("name", task)}
                      />
                      {errors.name ? (
                        <span className="text-red-500 text-xs italic flex m-1">
                          {errors.name as string}
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <RadiantTextInput
                        label="Task Price"
                        name="price"
                        mask={numberMask}
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <RadiantTextInput
                        label="Quantity"
                        name="quantity"
                        mask={numberMask}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <RadiantButton
                    type="button"
                    onClick={() => {
                      if (
                        !values.name ||
                        !values.price ||
                        parseInt(values.quantity) < 1
                      ) {
                        !values.name.label &&
                          setFieldError("name", "Must select a Task");
                        !values.price &&
                          setFieldError("price", "Task must have price");

                        parseInt(values.quantity) < 1 &&
                          setFieldError(
                            "quantity",
                            "Must have quantity greater then 1"
                          );
                        return;
                      }

                      setFieldValue("task_list", [
                        ...values.task_list,
                        {
                          job_name: values.name.label,
                          price: values.price,
                          quantity: values.quantity,
                          job_task_id: cuid(),
                          product_service_id: values.name.value,
                        },
                      ]);
                      setFieldValue("name", { label: "", value: "" });
                      setFieldValue("price", "");
                    }}
                  >
                    Add Task
                  </RadiantButton>
                </div>
              </div>
            </div>

            <div className="flex flex-row justify-between lg:col-span-2">
              <RadiantButton type="button" onClick={() => handleClose()}>
                Close
              </RadiantButton>
              <RadiantButton type="submit">Submit</RadiantButton>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default NewJobModal;
