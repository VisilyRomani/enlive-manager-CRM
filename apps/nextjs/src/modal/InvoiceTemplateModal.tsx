import Modal from "../component/Modal";
import { IModalProps } from "../types/modal";
import { trpc } from "../utils/trpc";
import { ChangeEvent, useEffect, useState } from "react";
import cuid from "cuid";
import RadiantTextInput from "../component/form/RadiantTextInput";
import { phoneMask } from "../types/SelectEnum";
import { Form, Formik } from "formik";
import RadiantButton from "../component/input/RadiantButton";
import { updateCreateInvoiceTemplateValdation } from "../validation/invoiceTemplateValidation";
import { toast } from "react-toastify";
import RadiantTextArea from "../component/form/RadiantTextArea";
import { intMask } from "../utils/util";
import Spinner from "../component/Spinner";

const InvoiceTemplateModal = ({
  dialog,
  setDialog,
  company_id,
}: IModalProps & { company_id: string }) => {
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
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      <div className="flex flex-col gap-3">
        <h1 className="text-gray-700 text-center text-4xl font-bold mb-10">
          Invoice Configuration
        </h1>
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
        <div>
          <RadiantButton onClick={() => setDialog(false)}>Close</RadiantButton>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceTemplateModal;
