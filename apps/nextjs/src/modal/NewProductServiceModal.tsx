import Modal from "../component/Modal";
import { IModalProps } from "../types/modal";
import RadiantButton from "../component/input/RadiantButton";
import { Form, Formik } from "formik";
import RadiantTextInput from "../component/form/RadiantTextInput";
import { trpc } from "../utils/trpc";
import { toast } from "react-toastify";
import RadiantSelect from "../component/input/RadiantSelect";
import { productServiceValidation } from "../validation/productServiceValidation";
import { capitalizeWord } from "../utils/util";

const NewProductServiceModal = ({
  dialog,
  setDialog,
  company_id,
  refetch,
}: IModalProps & { company_id: string }) => {
  const { data } = trpc.tax.getTax.useQuery(company_id);
  const addProductService = trpc.product_service.add.useMutation();
  return (
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      {dialog && (
        <div className="flex flex-col">
          <Formik
            initialValues={{
              name: "",
              tax: [] as { label: string; value: string }[],
            }}
            validationSchema={productServiceValidation}
            onSubmit={(values) => {
              addProductService.mutate(
                {
                  name: capitalizeWord(values.name),
                  tax: values.tax.map((i) => i.value),
                  company_id,
                },
                {
                  onSuccess: () => {
                    setDialog(false);
                    toast.success("Successfully created product or service");
                    refetch && refetch();
                  },
                  onError: () => {
                    toast.error("Failed to create product or service");
                  },
                }
              );
            }}
          >
            {({ setFieldValue, errors, touched }) => (
              <Form className="md:w-full p-1 flex gap-3 flex-col">
                <h1 className="text-gray-700 text-center text-2xl font-bold">
                  Add Product or Service
                </h1>
                <RadiantTextInput autoComplete="off" name="name" label="Name" />
                <RadiantSelect
                  label="Tax"
                  isMulti
                  options={data?.map((tax) => {
                    return {
                      label: tax.name + " - " + tax.percent + "%",
                      value: tax.tax_id,
                    };
                  })}
                  onChange={(data) => {
                    setFieldValue("tax", data);
                  }}
                />
                {!!errors.tax && !!touched.tax && (
                  <p className="text-red-500 text-xs italic">
                    {errors.tax as string}
                  </p>
                )}
                <div className="flex justify-between">
                  <RadiantButton onClick={() => setDialog(false)}>
                    Close
                  </RadiantButton>
                  <RadiantButton type="submit">Submit</RadiantButton>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </Modal>
  );
};

export default NewProductServiceModal;
