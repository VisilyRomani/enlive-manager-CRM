import { useMemo } from "react";
import { useRouter } from "next/router";
import { trpc } from "../../../utils/trpc";
import { Form, Formik } from "formik";
import RadiantTextInput from "../../../component/form/RadiantTextInput";
import RadiantTextArea from "../../../component/form/RadiantTextArea";
import RadiantButton from "../../../component/input/RadiantButton";
import { useState } from "react";
import RadiantSelect from "../../../component/input/RadiantSelect";
import ReusableTable from "../../../component/ReusableTable";
import { ColumnWithLooseAccessor } from "react-table";
import { BsTrash } from "react-icons/bs";
import NewAddressModal from "../../../modal/NewAddressModal";
import { GrStatusGoodSmall } from "react-icons/gr";
import Link from "next/link";
import { phoneMask, Platform, SelectPlatform } from "../../../types/SelectEnum";
import RadiantCheck from "../../../component/input/RadiantCheck";
import { toast } from "react-toastify";
import { GetServerSidePropsContext } from "next/types";
import { getSession } from "next-auth/react";
import { editClientValidation } from "../../../validation/clientValidation";
import Head from "next/head";
import { isNotAdmin } from "../../../utils/util";

interface IAddress {
  city: string;
  address_id: string;
  address: string;
  is_billing: boolean;
}

interface IJob {
  job_task: {
    price: string;
    job_name: string;
  }[];
  address: string;
  job_note: string | null;
  job_id: string;
  job_number: number;
}

interface IClientInfo {
  client_id: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  mobile_number: string | null;
  fax: string | null;
  term: string;
  note: string;
  email: string;
  platform: { label: string; value: string };
}

const ClientProfile = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const updateClient = trpc.client.update.useMutation();

  const [addressDialog, setAddressDialog] = useState(false);

  const deleteAddress = trpc.address.delete.useMutation();

  const {
    data: clientById,
    refetch: refetchClient,
    isLoading,
    isSuccess,
  } = trpc.client.byId.useQuery(id, {
    enabled: !!id,
  });

  const { clientInfo, address, jobs } = useMemo(() => {
    if (isSuccess) {
      return { ...clientById };
    } else {
      return {
        clientInfo: {} as IClientInfo,
        address: [] as IAddress[],
        jobs: [] as IJob[],
      };
    }
  }, [clientById, isSuccess]);

  const EditProfile = () => {
    return (
      <Formik
        enableReinitialize
        initialValues={{
          client_id: id,
          first_name: clientInfo.first_name,
          last_name: clientInfo.last_name || "",
          email: clientInfo.email || "",
          fax: clientInfo.fax || "",
          phone_number: clientInfo.phone_number || "",
          mobile_number: clientInfo.mobile_number || "",
          note: clientInfo.note || "",
          platform: clientInfo.platform,
          term: clientInfo.term || "",
        }}
        validationSchema={editClientValidation}
        onSubmit={async (values) => {
          updateClient.mutate(
            {
              ...values,
              first_name:
                clientInfo.first_name !== values.first_name
                  ? values.first_name
                  : undefined,
              last_name:
                clientInfo.last_name !== values.last_name
                  ? values.last_name
                  : undefined,
              email:
                clientInfo.email !== values.email ? values.email : undefined,
              fax: clientInfo.fax !== values.fax ? values.fax : undefined,
              phone_number:
                clientInfo.phone_number !== values.phone_number
                  ? values.phone_number
                  : undefined,
              mobile_number:
                clientInfo.mobile_number !== values.mobile_number
                  ? values.mobile_number
                  : undefined,
              note: clientInfo.note !== values.note ? values.note : undefined,
              term: clientInfo.term !== values.term ? values.term : undefined,
              platform:
                clientInfo.platform.value != values.platform.value
                  ? (values.platform.value as Platform)
                  : undefined,
              client_id: id,
            },
            {
              onSuccess: async () => {
                await refetchClient();
                toast.success("Successfully Saved Client Information");
              },
            }
          );
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="shadow">
            <div className="grid lg:grid-cols-3 gap-3 m-3">
              <RadiantTextInput label="First Name" name="first_name" />
              <RadiantTextInput label="Last Name" name="last_name" />
              <RadiantTextInput label="Email" name="email" />
              <RadiantTextInput mask={phoneMask} name="fax" label="Fax" />
              <RadiantTextInput
                mask={phoneMask}
                name="phone_number"
                label="Phone Number"
              />
              <RadiantTextInput
                mask={phoneMask}
                name="mobile_number"
                label="Mobile Number"
              />
              <RadiantTextArea label="Note" name="note" placeholder="Note" />

              <div>
                <RadiantSelect
                  label="Platform"
                  instanceId="clientProfile"
                  name="platform"
                  placeholder="Platform"
                  className="flex items-center"
                  value={values.platform}
                  onChange={(data) => setFieldValue("platform", data)}
                  options={SelectPlatform}
                />
              </div>
              <RadiantTextArea label="Term" name="term" placeholder="Term" />
            </div>
            <div className="flex flex-row-reverse p-3">
              <RadiantButton type="submit">Submit</RadiantButton>
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  const AddressTable = () => {
    const columns: ColumnWithLooseAccessor[] = [
      { Header: "Address", accessor: "address" },
      { Header: "City", accessor: "city" },
      {
        Header: "Active",
        accessor: "deleted",
        Cell: (props) => {
          const deleted = props.row.values?.deleted as boolean;
          return (
            <div className="flex justify-center">
              <GrStatusGoodSmall
                className={`${deleted ? "text-red-300" : "text-green-300"}`}
              />
            </div>
          );
        },
      },

      {
        Header: "Type",
        accessor: "is_billing",
        Cell: (props) => {
          const address = props.row.values?.address_id as string;
          const allData = props.data as IAddress[];
          const currentAddr = allData.find(
            (addr: IAddress) => addr?.address_id === address
          );

          return (
            <div className="flex flex-col px-6 gap-1">
              <RadiantCheck
                label="Billing Address"
                defaultChecked={!!currentAddr?.is_billing}
              />
            </div>
          );
        },
      },
      {
        Header: "",
        accessor: "address_id",
        Cell: (props) => {
          const deleted = props.row.values?.deleted as boolean;
          const address_id = props.row.values?.address_id as string;

          return (
            <div
              className="py-4 px-6"
              onClick={() => {
                if (deleted) return;
                deleteAddress.mutate(address_id, {
                  onSuccess: () => {
                    toast.success("Address deleted successfully!");
                    refetchClient();
                  },
                  onError: () => {
                    toast.error("Address deletion falied!");
                  },
                });
              }}
            >
              <BsTrash
                size={20}
                className={`${
                  deleted ? "text-gray-200" : "hover:text-gray-900"
                }`}
              />
            </div>
          );
        },
      },
    ];
    return (
      <div className="flex flex-col justify-between shadow p-3 h-full min-h-fit">
        <ReusableTable columns={columns} data={address} name={"Address"} />
        <div className="flex flex-row justify-between ">
          <RadiantButton onClick={() => setAddressDialog(true)}>
            Add Address
          </RadiantButton>
        </div>
      </div>
    );
  };

  const JobTable = () => {
    const columns: ColumnWithLooseAccessor[] = [
      { Header: "Job Number", accessor: "job_number" },
      { Header: "Address", accessor: "address" },
      { Header: "Status", accessor: "status" },

      {
        Header: "info",
        accessor: "job_id",
        Cell: ({ cell: { value: job_id } }: { cell: { value: string } }) => {
          return (
            <Link href={`/job/${job_id}`}>
              <a>
                <div>
                  <RadiantButton>Job Information</RadiantButton>
                </div>
              </a>
            </Link>
          );
        },
      },
    ];

    return (
      <div className="overflow-auto h-80">
        <ReusableTable columns={columns} data={jobs} name="Jobs" />
      </div>
    );
  };

  if (isLoading) {
    return <div></div>;
  }

  return (
    <>
      <Head>
        <title>Client Profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full h-full overflow-auto">
        <p className="text-xl font-bold capitalize text-center lg:col-span-2 ">
          {`${clientInfo.first_name} ${clientInfo.last_name}`}
        </p>
        <div className="grid lg:grid-cols-2 lg:grid-rows-[min-content_minmax(0_1fr)_minmax(0_1fr)] grid-cols-1 gap-3 p-3 w-full">
          <div className="lg:col-span-2 shadow ">
            <JobTable />
          </div>
          <EditProfile />
          <div className="h-full max-h-full min-h-[300px] overflow-auto shadow">
            <AddressTable />
          </div>
        </div>
        <NewAddressModal
          dialog={addressDialog}
          setDialog={setAddressDialog}
          refetch={refetchClient}
          client_id={id}
        />
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

export default ClientProfile;
