import Modal from "../component/Modal";
import { IModalProps } from "../types/modal";
import RadiantButton from "../component/input/RadiantButton";
import { Form, Formik } from "formik";
import RadiantTextInput from "../component/form/RadiantTextInput";
import { taxValidation } from "../validation/taxValidation";
import { trpc } from "../utils/trpc";
import { toast } from "react-toastify";

const NewTaxModal = ({
  dialog,
  setDialog,
  company_id,
  refetch,
}: IModalProps & { company_id: string }) => {
  const addTax = trpc.tax.add.useMutation();
  return (
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      {dialog && (
        <div className="flex flex-col">
          <Formik
            initialValues={{ name: "", percent: "" }}
            validationSchema={taxValidation}
            onSubmit={(values) => {
              addTax.mutate(
                {
                  name: values.name.toUpperCase(),
                  percent: parseInt(values.percent),
                  company_id: company_id,
                },
                {
                  onSuccess: () => {
                    toast.success("Successfully created tax");
                    refetch && refetch();
                    setDialog(false);
                  },
                  onError: () => {
                    toast.error("Failed to create new tax");
                  },
                }
              );
            }}
          >
            <Form className="md:w-full p-1 flex gap-3 flex-col">
              <h1 className="text-gray-700 text-center text-2xl font-bold">
                Add Tax
              </h1>
              <RadiantTextInput autoComplete="off" name="name" label="Name" />
              <RadiantTextInput
                autoComplete="off"
                name="percent"
                label="Percent"
              />
              <div className="flex justify-between">
                <RadiantButton
                  onClick={() => {
                    setDialog(false);
                  }}
                >
                  Close
                </RadiantButton>
                <RadiantButton type="submit">Submit</RadiantButton>
              </div>
            </Form>
          </Formik>
        </div>
      )}
    </Modal>
  );
};

export default NewTaxModal;
