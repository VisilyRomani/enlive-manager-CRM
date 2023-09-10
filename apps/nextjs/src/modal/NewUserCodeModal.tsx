import { IModalProps } from "../types/modal";
import RadiantButton from "../component/input/RadiantButton";
import Modal from "../component/Modal";

const NewUserCodeModal = ({
  dialog,
  setDialog,
  company_id,
  user_code,
}: IModalProps & { company_id: string; user_code: string }) => {
  return (
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      <div className="flex flex-col">
        {!!company_id && !!user_code ? (
          <h1 className="text-gray-700 text-center text-4xl font-bold mt-0 mb-6">
            User Code: {user_code}
          </h1>
        ) : (
          "Loading"
        )}
        <RadiantButton onClick={() => setDialog(false)}>Close</RadiantButton>
      </div>
    </Modal>
  );
};

export default NewUserCodeModal;
