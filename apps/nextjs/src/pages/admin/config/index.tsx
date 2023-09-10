import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";

import { intMask, isNotAdmin } from "../../../utils/util";
import Head from "next/head";
import { ChangeEvent, useEffect, useState } from "react";
import { TopTab } from "../../../component/TopTab";
import { trpc } from "../../../utils/trpc";
import { ColumnWithLooseAccessor } from "react-table";
import { BsTrash } from "react-icons/bs";
import { toast } from "react-toastify";
import RadiantButton from "../../../component/input/RadiantButton";
import ReusableTable from "../../../component/ReusableTable";
import NewProductServiceModal from "../../../modal/NewProductServiceModal";
import NewTaxModal from "../../../modal/NewTaxModal";
import ConfirmationModal from "../../../modal/ConfirmationModal";
import NewStockModal, { IEditStock } from "../../../modal/NewStockModal";
import { AiOutlineEdit, AiOutlineShoppingCart } from "react-icons/ai";
import cuid from "cuid";
import { Form, Formik } from "formik";
import { updateCreateInvoiceTemplateValdation } from "../../../validation/invoiceTemplateValidation";
import RadiantTextInput from "../../../component/form/RadiantTextInput";
import { phoneMask } from "../../../types/SelectEnum";
import RadiantTextArea from "../../../component/form/RadiantTextArea";
import Spinner from "../../../component/Spinner";

const Config = ({ session }: { session: Session }) => {
  const [tab, setTab] = useState(0);
  return (
    <main className="shadow flex flex-col flex-grow w-fill m-3 overflow-auto">
      <Head>
        <title>Config</title>
        <meta
          name="description"
          content="Create and manage your company's information"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-gray-700 text-center text-4xl font-bold mb-4">
        Configuration
      </h1>
      <div>
        <TopTab
          setTab={setTab}
          tab={tab}
          tabLabel={["Invoice", "Products and Services", "Tax", "Inventory"]}
        />
        {tab === 0 ? (
          <InvoiceTemplate session={session} />
        ) : tab === 1 ? (
          <ProductService session={session} />
        ) : tab === 2 ? (
          <Tax session={session} />
        ) : (
          <Inventory session={session} />
        )}
      </div>
    </main>
  );
};

const InvoiceTemplate = ({ session }: { session: Session }) => {
  const [PDF, setPDF] = useState<Blob>();
  const [uploadFile, setUploadFile] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<string>(
    JSON.stringify([
      {
        description: "1hr Manual labour (2 Workers)",
        tax: [
          {
            tax_id: "12312312",
            name: "GST",
            percent: 3,
          },
        ],
        quantity: 1.5,
        price: 5000,
      },
    ])
  );
  const company_id = session.user.company_id;
  const { data: invoice, refetch: refetchInvoice } =
    trpc.invoiceTemplate.getInvoice.useQuery(company_id);

  const createUpdateInvoice =
    trpc.invoiceTemplate.createUpdateInvoiceTemplate.useMutation();

  const updateLogoPath = trpc.invoiceTemplate.updateInvoiceLogo.useMutation();

  useEffect(() => {
    const abortController = new AbortController();
    const fetchPdf = async () => {
      setLoading(true);
      const res = await fetch("/api/pdf/invoice", {
        signal: abortController.signal,
        method: "POST",
        body: JSON.stringify({
          invoice_template: { ...invoice, logo: invoice?.logo },
          client: {
            name: "michael wong",
            address: {
              address: "438 lewin way",
              city: "saskatoon sk",
            },
            invoice_id: 1234,
            charge: JSON.parse(testData),
          },
        }),
      })
        .then(async (res) => await res.blob())
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error(error.message);
          }
        });
      setLoading(false);
      res && setPDF(res);
    };

    !!invoice?.logo && fetchPdf();
    return () => abortController.abort();
  }, [invoice, testData]);

  const getSignedUploadUrl =
    trpc.invoiceTemplate.getLogoSignedUrl.useMutation();

  const uploadLogoBucket = async (logo: File) => {
    setLoading(true);
    const logoId = cuid();
    getSignedUploadUrl.mutate(
      { company_id: company_id, logo: `${company_id}/logo/${logoId}` },
      {
        onSuccess: async (e: string) => {
          const result = await fetch(e, {
            method: "PUT",
            body: logo,
          });

          if (result.status === 200) {
            updateLogoPath.mutate(
              {
                company_id: company_id,
                logoPath: `${company_id}/logo/${logoId}`,
              },
              {
                onSuccess: () => {
                  setLoading(false);
                  toast.success("Updated invoice logo");
                  refetchInvoice();
                },
              }
            );
          }
        },
      }
    );
  };

  const updateImage = (fList: FileList) => {
    if (fList[0] && !!fList[0].type.match("image-*/")) {
      setUploadFile(fList[0]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
        <Formik
          enableReinitialize
          initialValues={{
            company_id: company_id ?? "",
            invoice_template_id: invoice?.invoice_template_id ?? "",
            gst: invoice?.gst ?? "",
            pst: invoice?.pst ?? "",
            address: invoice?.address ?? "",
            city: invoice?.city ?? "",
            phone: invoice?.phone ?? "",
            link: invoice?.link ?? "",
            email: invoice?.email ?? "",
            terms: invoice?.terms ?? "",
            footer: invoice?.footer ?? "",
            due_date: invoice?.due_date ?? 0,
            final_notice: invoice?.final_notice ?? 0,
          }}
          validationSchema={updateCreateInvoiceTemplateValdation}
          onSubmit={(value) => {
            createUpdateInvoice.mutate(
              {
                ...value,
                due_date: +value.due_date,
                final_notice: +value.final_notice,
              },
              {
                onSuccess: () => {
                  toast.success(
                    invoice?.invoice_template_id
                      ? "Updated Invoice"
                      : "Created Invoice"
                  );
                  !uploadFile && refetchInvoice();
                },
                onError: (e) => {
                  toast.error("Invalid Invoice Input");
                  console.error(e);
                },
              }
            );
            if (uploadFile) {
              uploadLogoBucket(uploadFile);
            }
          }}
        >
          <Form className="w-full h-full justify-center flex-col">
            <div className="grid grid-cols-[repeat(auto-fit,1fr)] gap-3">
              <RadiantTextInput
                label="GST/HST Registration Number"
                name="gst"
              />
              <RadiantTextInput label="PST Registration Number" name="pst" />
              <RadiantTextInput label="Address" name="address" />
              <RadiantTextInput label="City" name="city" />
              <RadiantTextInput
                mask={phoneMask}
                name="phone"
                label="Phone Number"
              />
              <RadiantTextInput label="Email" name="email" />
              <RadiantTextInput label="Website Link" name="link" />
              <RadiantTextInput label="Terms" name="terms" />
              <RadiantTextInput
                label="Days until Due"
                name="due_date"
                mask={intMask}
              />
              <RadiantTextInput
                label="Days until Final Notice"
                name="final_notice"
                mask={intMask}
              />
              <RadiantTextInput
                type="file"
                label="Upload Logo"
                name="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  e.target.files && updateImage(e.target.files);
                }}
              />
              <div className="lg:col-span-2 h-full">
                <RadiantTextArea label="Footer" name="footer" />
                {/* <RadiantArea
                    label="Test Data"
                    name="testData"
                    value={testData}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTestData(e.target.value)
                    }
                  /> */}
              </div>
            </div>

            <RadiantButton className="w-full" type="submit">
              Save Template
            </RadiantButton>
          </Form>
        </Formik>
        <div className="w-full">
          {loading ? (
            <Spinner />
          ) : (
            <object
              className="w-full h-full"
              data={PDF && URL.createObjectURL(PDF)}
              type="application/pdf"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ProductService = ({ session }: { session: Session }) => {
  const [dialog, setDialog] = useState(false);
  const deleteProductService = trpc.product_service.remove.useMutation();

  const { data: productService, refetch } =
    trpc.product_service.getProductService.useQuery(session.user.company_id);
  const columns: ColumnWithLooseAccessor[] = [
    { Header: "Name", accessor: "name" },
    {
      Header: "Tax",
      accessor: "product_service_tax",
      Cell: ({
        cell: { value: tax },
      }: {
        cell: {
          value: { tax: { tax_id: string; name: string; percent: number } }[];
        };
      }) => {
        return (
          <div className="p-3">
            {tax.map(({ tax }, i) => (
              <div key={i}>
                <div>{tax.name + " - " + tax.percent + "%"}</div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      Header: "",
      accessor: "product_service_id",
      Cell: ({
        cell: { value: product_service_id },
      }: {
        cell: { value: string };
      }) => {
        return (
          <BsTrash
            onClick={() => {
              deleteProductService.mutate(product_service_id, {
                onSuccess: () => {
                  toast.success("successfully deleted product/service");
                  refetch();
                },
                onError: () => {
                  toast.error("failed to delete tax");
                },
              });
            }}
            size={25}
            className="hover:text-gray-900"
          />
        );
      },
    },
  ];
  return (
    <div>
      <div className="flex justify-end mb-3">
        <RadiantButton type="button" onClick={() => setDialog(true)}>
          Add Product or Service
        </RadiantButton>
      </div>
      <ReusableTable
        name="productService"
        data={productService ?? []}
        columns={columns}
      />
      <NewProductServiceModal
        company_id={session.user.company_id}
        dialog={dialog}
        setDialog={setDialog}
        refetch={refetch}
      />
    </div>
  );
};

const Tax = ({ session }: { session: Session }) => {
  const [dialog, setDialog] = useState(false);

  const deleteTax = trpc.tax.remove.useMutation();

  const { data: tax, refetch } = trpc.tax.getTax.useQuery(
    session.user.company_id
  );

  const columns: ColumnWithLooseAccessor[] = [
    { Header: "Name", accessor: "name" },
    {
      Header: "Percent",
      accessor: "percent",
      Cell: ({ cell: { value: percent } }: { cell: { value: string } }) => {
        return <div className="p-3">{percent}%</div>;
      },
    },
    {
      Header: "",
      accessor: "tax_id",
      Cell: ({ cell: { value: tax_id } }: { cell: { value: string } }) => {
        return (
          <BsTrash
            onClick={() => {
              deleteTax.mutate(tax_id, {
                onSuccess: () => {
                  toast.success("successfully deleted");
                  refetch();
                },
                onError: () => {
                  toast.error("failed to delete tax");
                },
              });
            }}
            size={25}
            className="hover:text-gray-900"
          />
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-end gap-3 pb-3">
        <RadiantButton type="button" onClick={() => setDialog(true)}>
          Add Tax
        </RadiantButton>
      </div>
      <ReusableTable name="tax" data={tax ?? []} columns={columns} />
      <NewTaxModal
        dialog={dialog}
        setDialog={setDialog}
        company_id={session.user.company_id}
        refetch={refetch}
      />
    </div>
  );
};
const Inventory = ({ session }: { session: Session }) => {
  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState({ name: "", id: "" });

  const { data: stock, refetch } = trpc.stock.getAllItems.useQuery(
    session.user.company_id
  );
  const deleteStock = trpc.stock.deleteItem.useMutation();

  const [editItem, setEditItem] = useState<IEditStock>();

  useEffect(() => {
    !dialog && setEditItem(undefined);
  }, [dialog]);

  const columns: ColumnWithLooseAccessor[] = [
    { Header: "Name", accessor: "name" },
    {
      Header: "Manufacturer",
      accessor: "manufacturer",
    },
    {
      Header: "Quantity",
      accessor: "quantity",
    },

    {
      Header: "",
      accessor: "stock_id",
      Cell: ({
        cell: {
          row: { original },
        },
      }: {
        cell: { row: { original: IEditStock } };
      }) => {
        return (
          <div className="flex justify-center gap-3">
            <AiOutlineEdit
              onClick={() => {
                setEditItem({
                  stock_id: original.stock_id,
                  name: original.name,
                  manufacturer: original.manufacturer,
                  order_link: original.order_link,
                  quantity: original.quantity,
                });
                setDialog(true);
              }}
              size={25}
              className="hover:text-gray-900"
            />
            <a target="_blank" href={original.order_link} rel="noreferrer">
              <AiOutlineShoppingCart
                size={25}
                className="hover:text-gray-900"
              />
            </a>
            <BsTrash
              onClick={() => {
                setDeleteItem({
                  id: original.stock_id ?? "",
                  name: original.name ?? "",
                });
                setDeleteDialog(true);
              }}
              size={25}
              className="hover:text-gray-900"
            />
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <RadiantButton type="button" onClick={() => setDialog(true)}>
          Add Inventory
        </RadiantButton>
      </div>
      <ReusableTable data={stock ?? []} columns={columns} name={"inventory"} />
      <NewStockModal
        dialog={dialog}
        {...editItem}
        refetch={refetch}
        setDialog={setDialog}
        company_id={session.user.company_id}
      />
      <ConfirmationModal
        dialog={deleteDialog}
        setDialog={setDeleteDialog}
        prompt={`Are you sure you want to delete "${deleteItem.name}"?`}
        funct={() => {
          deleteStock.mutate(deleteItem.id, {
            onSuccess: () => {
              refetch();
            },
            onError: () => {
              toast.error("Failed to delete stock item");
            },
          });
        }}
      />
    </div>
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

export default Config;
