import { Form, Formik } from "formik";
import Modal from "../component/Modal";
import RadiantButton from "../component/input/RadiantButton";
import { trpc } from "../utils/trpc";
import { IModalProps } from "../types/modal";
import { paymentSelect, paymentType } from "../types/SelectEnum";
import RadiantTextInput from "../component/form/RadiantTextInput";
import RadiantSelect from "../component/input/RadiantSelect";
import { paymentValidation } from "../validation/paymentValidation";
import { numberMask } from "../utils/util";
import { toast } from "react-toastify";

const NewAddressModal = ({
  dialog,
  setDialog,
  invoice_id,
  refetch,
}: IModalProps & { invoice_id: string }) => {
  const createPayment = trpc.transaction.paymentTransaction.useMutation();

  return (
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      {dialog && (
        <Formik
          enableReinitialize
          initialValues={{
            invoice_id: invoice_id,
            amount: "",
            type: "" as paymentType,
            reference_code: "",
          }}
          validationSchema={paymentValidation}
          onSubmit={(values) => {
            createPayment.mutate(
              {
                ...values,
                amount: +(Number(values.amount) * 100),
              },
              {
                onSuccess: () => {
                  toast.success("Payment Submitted");
                  refetch && refetch();
                  setDialog(false);
                },
              }
            );
          }}
        >
          {({ values, setFieldValue, errors, touched }) => (
            <Form className="overflow-auto md:w-full p-1">
              <div className="flex flex-col gap-3">
                <h1 className="text-2xl font-bold text-gray-600 text-center w-full">
                  Submit Payment Information
                </h1>
                <div>
                  <RadiantTextInput
                    name="amount"
                    label="Amount"
                    className={`shadow w-full bg-gray-50 border border-gray-300 text-gray-700 text-sm focus:outline-gray-700 hover:bg-gray-200 rounded-sm p-2.5`}
                    mask={numberMask}
                  />
                  <div>
                    <RadiantSelect
                      label="Type"
                      options={paymentSelect}
                      onChange={(data) => setFieldValue("type", data?.value)}
                    />
                    {!!errors.type && !!touched.type && (
                      <p className="text-red-500 text-xs italic">
                        {errors.type}
                      </p>
                    )}
                  </div>
                  {values.type === "ETRANSFER" && (
                    <RadiantTextInput
                      label="Reference Code"
                      name="reference_code"
                    />
                  )}
                </div>
                <div className="flex justify-around">
                  <RadiantButton onClick={() => setDialog(false)}>
                    Close
                  </RadiantButton>
                  <RadiantButton type="submit">Submit</RadiantButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </Modal>
  );
};

export default NewAddressModal;
