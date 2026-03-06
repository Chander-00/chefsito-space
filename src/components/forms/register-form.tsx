"use client";

import { SignUpFormState } from "@/types/auth/formStates";
import { signUpAction } from "@/actions/auth";
import { useActionState } from "react";
import FormSubmitButton from "@/components/btns/form-submit";
import TextInput from "@/components/form-components/text-input";
import PasswordInput from "@/components/form-components/password-input";
import ErrorMessage from "@/components/form-components/error-message";
import SuccessMessage from "@/components/form-components/success-message";

const initialState: SignUpFormState = {
  message: null,
  errors: {},
  success: null,
};

export default function SignUpForm() {
  const [formState, formAction] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="w-3/4 mx-auto md:w-2/5">
      {/* Full Name */}
      <TextInput
        id="name"
        type="text"
        name="name"
        label="Fullname"
        errors={formState.errors?.name || []}
      />
      {/* Username */}
      <TextInput
        id="username"
        type="text"
        name="username"
        label="Username"
        errors={formState.errors?.username || []}
      />
      {/* Email */}
      <TextInput
        id="email"
        type="email"
        name="email"
        label="Email"
        errors={formState.errors?.email || []}
      />
      {/* Password */}
      <div className="grid md:grid-cols-2 md:gap-6">
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          errors={formState.errors?.password || []}
        />
        {/* Confirm Password */}
        <PasswordInput
          name="confirm_password"
          id="confirm_password"
          label="Confirm Password"
          errors={formState.errors?.confirmPassword || []}
        />
      </div>

      <ErrorMessage message={formState.message} />
      <SuccessMessage message={formState.success} />
      <FormSubmitButton
        text="Register"
        loadingText="Creating user..."
      ></FormSubmitButton>
    </form>
  );
}
