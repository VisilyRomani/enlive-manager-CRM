import React, { useRef, useEffect, useState } from "react";

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  modalClassName?: string;
}

const GenericModal: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  children,
  modalClassName = "",
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    dialogRef.current?.addEventListener("click", (event) => {
      if (event.target === dialogRef.current) {
        onClose();
      }
    });
  }, [onClose]);

  useEffect(() => {
    const dialogElement = dialogRef.current;

    if (dialogElement) {
      if (isOpen) {
        dialogElement.showModal();
      } else {
        dialogElement.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    // Check if the <dialog> element is supported
    setIsSupported(
      !!(dialogRef.current && typeof dialogRef.current.showModal === "function")
    );

    if (!isSupported) {
      console.warn("<dialog> element is not supported in this browser.");
    }
  }, [isSupported]);

  return isSupported ? (
    <dialog
      ref={dialogRef}
      className={` w-full md:w-fit h-full md:h-fit shadow-md modal-base ${modalClassName}`}
    >
      {children}
    </dialog>
  ) : null;
};

export default GenericModal;
