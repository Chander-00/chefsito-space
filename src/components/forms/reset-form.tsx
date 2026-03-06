"use client";
import { useActionState } from "react";

import TextInput from "../form-components/text-input";
import FormSubmitButton from "../btns/form-submit";
import ErrorMessage from "../form-components/error-message";
import { ResetFormState } from "@/types/auth/formStates";
import SuccessMessage from "../form-components/success-message";
import { resetAction } from "@/actions/reset-password";

const initialState: ResetFormState = {
  message: null,
  error: null,
};

export default function ResetForm() {
  const [state, formAction] = useActionState(resetAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <h3 className="text-3xl font-extrabold text-trinidad-50">
        Reset Password
      </h3>

      {/* Email */}
      <TextInput id="email" type="email" name="email" label="Email" />

      <div>
        <ErrorMessage message={state.error} />
        <SuccessMessage message={state.message} />
        <FormSubmitButton
          text="Change password"
          loadingText="Sending verification email..."
        />

        {/* {state.error ||
            (urlError && <ErrorMessage message={state.error || urlError} />)} */}
      </div>
    </form>
  );
}
