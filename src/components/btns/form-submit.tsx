"use client";

import { useFormStatus } from "react-dom";

interface FormSubmitButtonProps {
  text: string;
  loadingText: string;
  extraClasses?: string;
  disabled?: boolean;
}

const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({
  text,
  loadingText,
  extraClasses,
  disabled,
}) => {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      className={`w-full rounded-md bg-trinidad-500 px-4 py-2.5 text-sm tracking-wide text-white shadow-xl hover:bg-trinidad-700 focus:outline-none ${extraClasses}`}
      disabled={isDisabled}
    >
      {isDisabled ? loadingText : text}
    </button>
  );
};

export default FormSubmitButton;
