import { Form, Formik } from "formik";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next/types";
import { useCallback, useState } from "react";
import ShortUniqueId from "short-unique-id";
import RadiantTextInput from "../../component/form/RadiantTextInput";
import RadiantButton from "../../component/input/RadiantButton";
import NewUserCodeModal from "../../modal/NewUserCodeModal";
import { phoneMask, selectRole, userRole } from "../../types/SelectEnum";
import { trpc } from "../../utils/trpc";
import {
  companyConnectValidation,
  companyValidation,
} from "../../validation/companyValidation";
import { toast } from "react-toastify";
import Head from "next/head";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import ReusableTable from "../../component/ReusableTable";
import { ColumnWithLooseAccessor } from "react-table";
import Image from "next/image";
import RadiantCheck from "../../component/input/RadiantCheck";
import RadiantSelect from "../../component/input/RadiantSelect";
import ConfirmationModal from "../../modal/ConfirmationModal";

type CompanyDataType = {
  company_id: string;
  user_id: string;
  role: string;
  company: {
    company_id: string;
    company_name: string;
    address: string;
    email: string;
    number: string;
  };
  isCreate: boolean;
};

const Company = ({ session }: { session: Session }) => {
  const user_id = session.user.id;
  const router = useRouter();

  const ManageCreateCompany = () => {
    const [updateConfirmationDialog, setUpdateConfirmationDialog] =
      useState(false);
    const company_id = session.user.company_id;
    const uid = new ShortUniqueId({ length: 6 });
    const updateCreateCompany = trpc.company.signUp.useMutation();
    const newCompanyCode = trpc.company_code.createCode.useMutation();

    const [companyData, setCompanyData] = useState<CompanyDataType>();
    const companyUpdate = useCallback(() => {
      if (companyData) {
        updateCreateCompany.mutate(
          {
            company_id: companyData.company_id,
            user_id: user_id,
            role: "OWNER",
            company: companyData.company,
            isCreate: !company_id,
          },
          {
            onSuccess: () => {
              !company_id
                ? toast.success("Successfully Registered Company")
                : toast.success("Successfully Updated Company");
              router.reload();
            },
          }
        );
      }
    }, [companyData, company_id, updateCreateCompany]);

    const { data, refetch: refetchCompany } = trpc.company.getCompany.useQuery(
      company_id,
      {
        enabled: !!company_id,
      }
    );

    const { data: workers, refetch: refetchWorkers } =
      trpc.user.allUsers.useQuery(company_id, {
        enabled: !!company_id,
      });

    const updateUser = trpc.user.updateUser.useMutation();

    const [codeDialog, setCodeDialog] = useState(false);
    const [userCode, setUserCode] = useState("");

    const columns: ColumnWithLooseAccessor[] = [
      {
        Header: "",
        accessor: "image",
        Cell: ({ cell: { value: image } }: { cell: { value: string } }) => {
          return <Image src={image} alt="" width={30} height={30} />;
        },
      },

      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      {
        Header: "Role",
        accessor: "user_role",
        Cell: ({
          cell: {
            row: { original },
          },
        }: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cell: { row: any };
        }) => {
          return (
            <div className="flex items-center justify-center">
              <RadiantSelect
                isDisabled={original.user_role === "OWNER"}
                defaultValue={{
                  label: String(original.user_role),
                  value: String(original.user_role),
                }}
                options={selectRole}
                onChange={(data) => {
                  updateUser.mutate(
                    {
                      id: original.id ?? "",
                      user_role: (data?.value as userRole) || undefined,
                    },
                    {
                      onSuccess: () => {
                        refetchWorkers();
                      },
                    }
                  );
                }}
              />
            </div>
          );
        },
      },
      {
        Header: "active",
        accessor: "active",
        Cell: ({
          cell: {
            row: { original },
          },
        }: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cell: { row: any };
        }) => {
          return (
            <div className="flex items-center justify-center">
              <RadiantCheck
                checked={!!original.active}
                onChange={() => {
                  updateUser.mutate(
                    {
                      id: original.id ?? "",
                      active: !original.active,
                    },
                    {
                      onSuccess: () => {
                        refetchWorkers();
                      },
                    }
                  );
                }}
              />
            </div>
          );
        },
      },
    ];

    return (
      <div className="flex flex-col gap-10">
        <div>
          <h1 className="text-gray-700 text-4xl font-bold mt-0 mb-6">
            {company_id ? "Update Company" : "Register Company"}
          </h1>
          <Formik
            enableReinitialize
            initialValues={{
              company_id: company_id ?? "",
              company_name: data?.company_name ?? "",
              address: data?.address ?? "",
              email: data?.email ?? "",
              number: data?.number ?? "",
            }}
            validationSchema={companyValidation}
            onSubmit={(values) => {
              setCompanyData({
                company_id: values.company_id,
                user_id: user_id,
                role: "OWNER",
                company: values,
                isCreate: !company_id,
              });

              setUpdateConfirmationDialog(true);
            }}
          >
            <Form className="flex flex-col gap-3">
              <div className="grid lg:grid-cols-2 gap-3 ">
                <RadiantTextInput name="company_name" label="Company Name" />
                <RadiantTextInput name="address" label="Company Address" />
                <RadiantTextInput name="email" label="Email" />
                <RadiantTextInput
                  name="number"
                  label="Phone Number"
                  mask={phoneMask}
                />
              </div>
              <RadiantButton type="submit">
                {company_id ? "Update Company" : "Register Company"}
              </RadiantButton>
            </Form>
          </Formik>
          <ConfirmationModal
            dialog={updateConfirmationDialog}
            setDialog={setUpdateConfirmationDialog}
            prompt={`${
              company_id
                ? "Are you sure you want to update company info?"
                : "Are you sure you want to create company info?"
            }`}
            refetch={() => {
              !company_id ? router.reload() : refetchCompany();
            }}
            funct={companyUpdate}
          />
        </div>
        {company_id && (
          <div>
            <h1 className="text-gray-700 text-4xl font-bold mt-0 mb-6">
              Workers
            </h1>
            <div className="flex flex-row justify-between mt-0 mb-3">
              <RadiantButton
                onClick={() => {
                  setCodeDialog(true);
                  const random_id = uid();
                  setUserCode(random_id);
                  newCompanyCode.mutate({
                    code: random_id,
                    company_id: company_id,
                  });
                }}
              >
                Generate User Code
              </RadiantButton>
            </div>
            <div className="w-full h-56 overflow-auto">
              <ReusableTable
                name="workers"
                data={workers ?? []}
                columns={columns}
              />
            </div>

            <NewUserCodeModal
              dialog={codeDialog}
              setDialog={setCodeDialog}
              company_id={company_id}
              user_code={userCode}
            />
          </div>
        )}
      </div>
    );
  };

  const ConnectCompany = () => {
    const connectCompany = trpc.company.connectCompany.useMutation();

    return (
      <div className="flex justify-center items-center w-full">
        <Formik
          initialValues={{
            company_code: "",
          }}
          validationSchema={companyConnectValidation}
          onSubmit={(values) => {
            connectCompany.mutate(
              { company_code: values.company_code, user_id: user_id },
              {
                onSuccess: () => {
                  router.reload();
                },
                onError: () => {
                  toast.error("Failed to link account to Company");
                },
              }
            );
          }}
        >
          <Form className="flex justify-center items-center flex-col gap-3 max-w-md ">
            <h1 className="text-gray-700 text-center text-4xl font-bold mt-0 mb-6">
              Connect Company
            </h1>
            <RadiantTextInput name="company_code" label="Company Code" />

            <RadiantButton type="submit">Connect Company</RadiantButton>
          </Form>
        </Formik>
      </div>
    );
  };

  const ConnectedCompany = () => {
    const { data } = trpc.company.getCompany.useQuery(session.user.company_id);
    return (
      <div>
        <h1 className="text-gray-700 text-center text-4xl font-bold mt-0 mb-6">
          {data?.company_name}
        </h1>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Company</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-10 w-full overflow-auto">
        {session.user.user_role !== "OWNER" && session.user.company_id ? (
          <ConnectedCompany />
        ) : session.user.user_role === "OWNER" ? (
          <ManageCreateCompany />
        ) : (
          <ConnectCompany />
        )}
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
  }
  if (!session.user.company_id) {
    return {
      props: { session },
    };
  }

  return {
    props: { session },
  };
}

export default Company;
