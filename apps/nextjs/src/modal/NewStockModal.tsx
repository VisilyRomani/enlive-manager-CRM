import Modal from "../component/Modal";
import { IModalProps } from "../types/modal";
import RadiantButton from "../component/input/RadiantButton";
import { trpc } from "../utils/trpc";
import { Form, Formik } from "formik";
import RadiantTextInput from "../component/form/RadiantTextInput";
import { NewStockValidation } from "../validation/inventoryValidation";
import { toast } from "react-toastify";

export interface IEditStock {
  name?: string;
  manufacturer?: string;
  order_link?: string;
  quantity?: string;
  stock_id?: string;
}

const NewStockModal = ({
  dialog,
  setDialog,
  company_id,
  name,
  stock_id,
  refetch,
  manufacturer,
  order_link,
  quantity,
}: IModalProps & { company_id: string } & IEditStock) => {
  const AddStock = trpc.stock.addUpdateItem.useMutation();

  return (
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={{
            company_id: company_id ?? "",
            name: name ?? "",
            manufacturer: manufacturer ?? "",
            order_link: order_link ?? "",
            stock_id: stock_id ?? "",
            quantity: quantity ?? "",
          }}
          validationSchema={NewStockValidation}
          onSubmit={(values) => {
            if (!values.company_id) {
              toast.error("ERROR: Missing company id");
            } else {
              AddStock.mutate(
                {
                  ...values,
                  quantity: parseInt(values.quantity) ?? 0,
                },
                {
                  onSuccess: () => {
                    toast.success("Successfully created inventory item");
                    setDialog(false);
                    refetch && refetch();
                  },
                  onError: (err) => {
                    toast.error("Error Creating Inventory");
                    console.error(err);
                  },
                }
              );
            }
          }}
        >
          <Form className="md:w-full p-1 flex gap-3 flex-col">
            {stock_id ? (
              <h1 className="text-gray-700 text-center text-2xl font-bold">
                Edit Stock
              </h1>
            ) : (
              <h1 className="text-gray-700 text-center text-2xl font-bold">
                Add Stock
              </h1>
            )}
            <RadiantTextInput label="Name" name="name" />
            <RadiantTextInput label="Manufacturer" name="manufacturer" />
            <RadiantTextInput label="Order Link" name="order_link" />
            <RadiantTextInput label="Quantity" name="quantity" />
            <div className="flex flex-row justify-between">
              <RadiantButton
                onClick={() => {
                  setDialog(false);
                }}
                type="button"
              >
                Close
              </RadiantButton>

              <RadiantButton type="submit">
                {stock_id ? "Save" : "Create"}
              </RadiantButton>
            </div>
          </Form>
        </Formik>
      </div>
    </Modal>
  );
};

export default NewStockModal;
