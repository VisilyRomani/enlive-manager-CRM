import Modal from "../component/Modal";
import RadiantButton from "../component/input/RadiantButton";
import { IModalProps } from "../types/modal";

const ConfirmationModal = ({
  dialog,
  setDialog,
  prompt,
  funct,
}: IModalProps & { prompt: string; funct?: () => void }) => {
  return (
    <Modal isOpen={dialog} onClose={() => setDialog(false)}>
      <h1 className="text-gray-700 text-center text-2xl font-bold max-w-sm pb-10">
        {prompt}
      </h1>
      <div className="flex flex-row justify-between">
        <RadiantButton
          onClick={() => {
            setDialog(false);
          }}
        >
          No
        </RadiantButton>
        <RadiantButton
          disabled={!funct}
          onClick={() => {
            funct && funct();
            setDialog(false);
          }}
        >
          Yes
        </RadiantButton>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
