import { Form, Formik } from "formik";
import Modal from "../component/Modal";
import RadiantTextInput from "../component/form/RadiantTextInput";
import RadiantButton from "../component/input/RadiantButton";
import RadiantCheck from "../component/input/RadiantCheck";
import { trpc } from "../utils/trpc";
import { capitalizeWord } from "../utils/util";
import { addressValidaiton } from "../validation/addressValidation";
import { IModalProps } from "../types/modal";

const NewAddressModal = ({
  dialog,
  setDialog,
  refetch,
  client_id,
}: IModalProps & { client_id: string }) => {
  const newAddress = trpc.address.add.useMutation();
  return (
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      <Formik
        enableReinitialize
        initialValues={{
          address: "",
          city: "",
          province: "Saskatchewan",
          country: "Canada",
          client_id: client_id,
          is_billing: false,
        }}
        validationSchema={addressValidaiton}
        onSubmit={(values) => {
          newAddress.mutate(
            {
              ...values,
              address: capitalizeWord(values.address),
              city: capitalizeWord(values.city),
            },
            {
              onSuccess: () => {
                !!refetch && refetch();
                setDialog(false);
              },
            }
          );
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <div className="flex flex-wrap -mx-3 mb-6 gap-3">
              <RadiantTextInput name="address" placeholder="Address" />
              <RadiantTextInput name="city" placeholder="City" />
            </div>
            <div className="flex flex-col">
              <RadiantCheck
                label="Billing Address"
                defaultChecked={values.is_billing}
                onChange={() => setFieldValue("is_billing", !values.is_billing)}
              />
            </div>
            <div className="flex justify-around">
              <RadiantButton onClick={() => setDialog(false)}>
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

export default NewAddressModal;
