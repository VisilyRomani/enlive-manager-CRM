import { AppRouter } from "@acme/api";
import { Form, Formik } from "formik";
import Modal from "../component/Modal";
import RadiantCheckBox from "../component/form/RadiantCheckbox";
import RadiantTextArea from "../component/form/RadiantTextArea";
import RadiantTextInput from "../component/form/RadiantTextInput";
import RadiantButton from "../component/input/RadiantButton";
import RadiantSelect from "../component/input/RadiantSelect";
import { phoneMask, SelectPlatform } from "../types/SelectEnum";
import { trpc } from "../utils/trpc";
import { IModalProps } from "../types/modal";
import { toast } from "react-toastify";
import { capitalizeFirstLetter, capitalizeWord } from "../utils/util";
import { clientValidation } from "../validation/clientValidation";
import { Session } from "next-auth";

const NewClientModal = ({
  dialog,
  setDialog,
  refetch,
  session,
}: IModalProps & { session: Session }) => {
  const createClient =
    trpc.client.create.useMutation<AppRouter["client"]["create"]>();

  return (
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      <Formik
        enableReinitialize
        initialValues={{
          first_name: "",
          last_name: "",
          phone_number: "",
          mobile_number: "",
          fax: "",
          email: "",
          address: "",
          city: "",
          platform: { label: "Select Platform", value: "" },
          term: "",
          note: "",
          billingaddress: false,
          company_id: session.user.company_id,
        }}
        validationSchema={clientValidation}
        onSubmit={(values) => {
          createClient.mutate(
            {
              ...values,
              first_name: capitalizeFirstLetter(values.first_name),
              last_name: capitalizeFirstLetter(values.last_name),
              phone_number: !!values.phone_number ? values.phone_number : null,
              mobile_number: !!values.mobile_number
                ? values.mobile_number
                : null,
              fax: !!values.fax ? values.fax : null,
              address: capitalizeWord(values.address),
              city: capitalizeWord(values.city),
              platform: values.platform.value,
            },
            {
              onSuccess: () => {
                !!refetch && refetch();
                toast.success("Successfully Created Client");
                setDialog(false);
              },
            }
          );
        }}
      >
        {({ values, setFieldValue, errors, touched, handleBlur }) => (
          <Form className="overflow-auto md:w-full p-1">
            <h1 className="text-2xl font-bold text-gray-600 text-center w-full">
              Create New Client
            </h1>

            <div className="grid lg:grid-cols-3 gap-3 max-h-[screen] w-full">
              <RadiantTextInput label="First Name" name="first_name" />
              <RadiantTextInput label="Last Name" name="last_name" />
              <RadiantTextInput label="Email" name="email" />
              <RadiantTextInput
                label="Phone Number"
                name="phone_number"
                mask={phoneMask}
              />
              <RadiantTextInput
                mask={phoneMask}
                name="mobile_number"
                label="Mobile Number"
              />
              <RadiantTextInput name="fax" label="Fax" mask={phoneMask} />
              <RadiantTextArea label="Term" name="term" />
              <RadiantTextArea label="Note" name="note" />
              <RadiantTextInput label="Address" name="address" />
              <RadiantTextInput name="city" label="City" />
              <div>
                <RadiantCheckBox
                  label="Billing Address"
                  name="billingaddress"
                  placeholder="City"
                />
              </div>

              <div>
                <RadiantSelect
                  label="Platform"
                  value={values.platform}
                  inputId="platform"
                  onChange={(data) => setFieldValue("platform", data)}
                  instanceId={"filter"}
                  options={SelectPlatform}
                  onBlur={handleBlur}
                />
                {!!errors.platform?.value && !!touched.platform?.value && (
                  <p className="text-red-500 text-xs italic">
                    {errors.platform?.value}
                  </p>
                )}
              </div>
              <div className="lg:col-span-3 flex justify-around">
                <RadiantButton onClick={() => setDialog(false)}>
                  Close
                </RadiantButton>
                <RadiantButton type="submit">Create</RadiantButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default NewClientModal;
