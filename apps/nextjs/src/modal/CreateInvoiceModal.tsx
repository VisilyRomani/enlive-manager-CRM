import { ChangeEvent, useEffect, useRef, useState } from "react";
import RadiantButton from "../component/input/RadiantButton";
import { trpc } from "../utils/trpc";
import { IModalProps } from "../types/modal";
import { toast } from "react-toastify";
import { numberMask } from "../utils/util";
import MaskedInput from "react-text-mask";
import debounce from "lodash.debounce";
import Spinner from "../component/Spinner";
import { TopTab } from "../component/TopTab";
import Modal from "../component/Modal";

export const CreateInvoiceModal = ({
  dialog,
  setDialog,
  refetch,
  company_id,
  job_id,
}: IModalProps & { company_id: string; job_id: string | undefined }) => {
  const completeInvoice = trpc.invoice.completeInvoiceTransaction.useMutation();
  const [loading, setLoading] = useState(false);
  const [tabMenu, setTabMenu] = useState(0);
  const [payment, setPayment] = useState(0);
  const { data: invoiceData } = trpc.invoice.createNewInvoice.useQuery(
    {
      company_id: company_id,
      job_id: job_id as string,
      payment: payment ?? 0,
    },
    { enabled: !!job_id }
  );
  const [pdf, setPDF] = useState<Blob>();

  const debouncedPrice = useRef(
    debounce((event: ChangeEvent<HTMLInputElement>) => {
      setPayment(Number(event.target.value));
    }, 300)
  ).current;

  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    const fetchPdf = async () => {
      const res = await fetch("/api/pdf/invoice", {
        signal: abortController.signal,
        method: "POST",
        body: JSON.stringify({
          ...invoiceData,
          client: { ...invoiceData?.client, payment: payment },
        }),
      })
        .then(async (response) => {
          setLoading(false);
          if (response.ok) {
            return await response.blob();
          }
          throw new Error("Something went wrong");
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            toast.error("Failed to generate PDF");
          }
        });

      res && setPDF(res);
    };

    if (invoiceData && dialog) {
      fetchPdf();
    }

    if (!dialog) {
      setPDF(undefined);
      setPayment(0);
    }
    return () => abortController.abort();
  }, [invoiceData, payment, dialog]);

  const handleCompleteInvoice = () => {
    if (invoiceData) {
      completeInvoice.mutate(
        {
          ...invoiceData,
          client: { ...invoiceData?.client, payment: payment },
        },
        {
          onSuccess: () => {
            refetch && refetch();
            setDialog(false);
            toast.success("Sent Invoice");
          },
          onError: (error) => {
            setDialog(false);
            toast.error(error.message);
          },
        }
      );
    }
  };

  return (
    <Modal
      isOpen={dialog}
      modalClassName="!w-full !h-full"
      onClose={() => setDialog(false)}
    >
      <div className="flex flex-col gap-3 overflow-auto h-full">
        <h1 className="text-gray-700 text-center text-4xl font-bold">
          Generate Invoice
        </h1>
        <div className="grid lg:grid-cols-2 gap-3">
          {completeInvoice.isLoading ? (
            <Spinner />
          ) : (
            <>
              <div className="flex flex-col">
                <TopTab
                  setTab={setTabMenu}
                  tab={tabMenu}
                  tabLabel={["PDF Preview", "Email Preview"]}
                />
                {tabMenu === 0 ? (
                  loading ? (
                    <Spinner />
                  ) : (
                    <object
                      className="w-full h-[700px] max-w-[screen]"
                      data={pdf && URL.createObjectURL(pdf)}
                      type="application/pdf"
                    />
                  )
                ) : (
                  <div className="bg-slate-100 rounded-lg h-[700px] max-w-[screen] overflow-auto">
                    <div
                      className="p-3"
                      dangerouslySetInnerHTML={{
                        __html: invoiceData?.__html ?? "",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col p-1">
                <div>
                  <label className="uppercase tracking-wide text-gray-700 text-xs font-bold m-1 whitespace-nowrap">
                    Payment
                  </label>
                  <MaskedInput
                    type="text"
                    value={payment}
                    className={`shadow w-full bg-gray-50 border border-gray-300 text-gray-700 text-sm focus:outline-gray-700 hover:bg-gray-200 rounded-sm p-2.5`}
                    mask={numberMask}
                    onChange={debouncedPrice}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-row justify-between">
          <RadiantButton onClick={() => setDialog(false)}>Close</RadiantButton>
          <RadiantButton
            disabled={completeInvoice.isLoading}
            onClick={handleCompleteInvoice}
          >
            Send
          </RadiantButton>
        </div>
      </div>
    </Modal>
  );
};
