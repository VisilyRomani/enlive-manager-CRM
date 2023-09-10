import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import RadiantTextInput from "../../../component/form/RadiantTextInput";
import RadiantButton from "../../../component/input/RadiantButton";
import RadiantInput from "../../../component/input/RadiantInput";
import RadiantSelect from "../../../component/input/RadiantSelect";
import { selectStatus, status } from "../../../types/SelectEnum";
import { trpc } from "../../../utils/trpc";
import format from "date-fns/format";
import { toast } from "react-toastify";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import JobTasks from "../../../component/JobTasks";
import { StringToPriceint, isNotAdmin, numberMask } from "../../../utils/util";
import { addTaskValidation } from "../../../validation/jobValidation";
import RadiantTextArea from "../../../component/form/RadiantTextArea";
import Head from "next/head";
import { Session } from "next-auth";
import Link from "next/link";

type selectType = {
  value: string;
  label: string;
};
const JobInformation = ({ session }: { session: Session }) => {
  const router = useRouter();
  const id = router.query.id as string;
  const editJob = trpc.job.edit.useMutation();
  const {
    data,
    refetch: refetchJob,
    isLoading,
  } = trpc.job.byId.useQuery(id, {
    enabled: !!id,
  });

  const { data: productService } =
    trpc.product_service.getProductService.useQuery(session.user.company_id);
  const productServiceOptions = productService?.map((ps) => {
    return { label: ps.name, value: ps.product_service_id };
  }) ?? [{ label: "", value: "" }];

  const EditJobInfo = () => {
    return (
      <Formik
        enableReinitialize
        initialValues={{
          job_note: data?.job?.job_note || "",
          status: {
            value: data?.job?.status || "",
            label: data?.job?.status || "",
          },
        }}
        onSubmit={(values) => {
          editJob.mutate(
            {
              id: id,
              status: values.status.value as status,
              job_note: values.job_note,
            },
            {
              onSuccess: async () => {
                await refetchJob();
                toast.success("Successfully saved job information!");
              },
            }
          );
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="shadow p-3 flex flex-col justify-between">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="grid grid-rows-3 gap-1">
                <RadiantInput
                  label="Job Number"
                  disabled
                  value={data?.job?.job_number}
                />
                <div className="z-50">
                  <Link href={`/admin/client/${data?.client.client_id}`}>
                    <a>
                      <div>
                        <label className="uppercase tracking-wide text-gray-700 text-xs font-bold m-1">
                          Client Name
                        </label>
                        <p className="border border-gray-200 text-gray-700 text-sm bg-gray-50 focus:outline-gray-700  rounded-sm p-2.5 hover:bg-violet-200 shadow-md">
                          {data?.client?.first_name +
                            " " +
                            data?.client?.last_name}
                        </p>
                      </div>
                    </a>
                  </Link>
                </div>

                <RadiantInput
                  label="Address"
                  disabled
                  value={data?.client?.address}
                />
              </div>
              <div className="grid grid-rows-3 gap-1">
                <RadiantInput
                  type="date"
                  disabled
                  label="Creation Date"
                  value={
                    data?.job?.creation_date &&
                    format(data?.job.creation_date, "yyyy-MM-dd")
                  }
                />
                <div>
                  <RadiantSelect
                    label="Status"
                    instanceId="status"
                    defaultValue={values.status}
                    onChange={(data) => setFieldValue("status", data)}
                    options={selectStatus}
                  />
                </div>
              </div>
              <RadiantTextArea label="Note" name="job_note" />
            </div>

            <div className="flex flex-row-reverse">
              <RadiantButton type="submit">Save</RadiantButton>
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  const AddTask = () => {
    const addTask = trpc.task.add.useMutation();
    return (
      <div className="shadow p-3 flex flex-col justify-between">
        <JobTasks
          type="EDIT"
          job_data={data?.job_task || []}
          refetch={refetchJob}
        />
        <Formik
          enableReinitialize
          initialValues={{
            job_id: id,
            task: undefined as unknown as selectType,
            price: "",
            quantity: "1",
          }}
          validationSchema={addTaskValidation}
          onSubmit={(values) => {
            addTask.mutate(
              {
                job_id: values.job_id,
                product_service_id: values.task.value,
                price: StringToPriceint(values.price),
                quantity: Number(values.quantity),
              },
              {
                onSuccess: () => {
                  refetchJob();
                  toast.success("Successfully added task");
                },
                onError: () => {
                  toast.error("Failed to add task");
                },
              }
            );
          }}
        >
          {({ setFieldValue, errors }) => (
            <Form>
              <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-3 ">
                  <div className="w-full">
                    <RadiantSelect
                      label="Task"
                      options={productServiceOptions ?? []}
                      onChange={(task) => {
                        setFieldValue("task", task);
                      }}
                    />
                    {errors.task ? (
                      <span className="text-red-500 text-xs italic flex m-1">
                        {errors.task as string}
                      </span>
                    ) : null}
                  </div>
                  <RadiantTextInput
                    label="Task Price"
                    name="price"
                    mask={numberMask}
                    autoComplete="off"
                  />
                  <RadiantTextInput
                    label="Quantity"
                    name="quantity"
                    mask={numberMask}
                    autoComplete="off"
                  />
                </div>
                <RadiantButton type="submit">Add Task</RadiantButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    );
  };

  if (isLoading) {
    return;
  }

  return (
    <>
      <Head>
        <title>Job Information</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid gap-3 lg:grid-cols-2 grid-cols-1 w-full h-full overflow-auto">
        <EditJobInfo />
        <AddTask />
      </main>
    </>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext<never>
) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  } else if (
    !session?.user?.company_id ||
    isNotAdmin(session?.user?.user_role)
  ) {
    return {
      redirect: {
        destination: "/admin/company",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default JobInformation;
