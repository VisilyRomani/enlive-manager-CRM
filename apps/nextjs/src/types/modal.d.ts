export interface IModalProps {
  dialog: boolean;
  setDialog: Dispatch<SetStateAction<boolean>>;
  refetch?: () => void;
}
