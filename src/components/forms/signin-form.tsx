"use client";

import OauthButtons from "../oauth-btns";
import Divider from "../form-components/divider";
import ErrorMessage from "../form-components/error-message";
import { useSearchParams } from "next/navigation";

// --- Credential-based sign-in (commented out for OAuth-only) ---
// import { useActionState } from "react";
// import TextInput from "../form-components/text-input";
// import PasswordInput from "../form-components/password-input";
// import FormSubmitButton from "../btns/form-submit";
// import CheckboxInput from "../form-components/checkbox-input";
// import FormHeader from "../form-components/header";
// import { authenticate } from "@/actions/auth";
// import { SignInFormState } from "@/types/auth/formStates";
// import SuccessMessage from "../form-components/success-message";
// import Link from "next/link";
//
// const initialState: SignInFormState = {
//   message: null,
//   error: null,
// };

export default function SignInForm() {
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider"
      : "";

  // --- Credential-based sign-in (commented out for OAuth-only) ---
  // const [state, formAction] = useActionState(authenticate, initialState);

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-3xl font-extrabold text-trinidad-50">Sign in</h3>
        <p className="mt-4 text-sm text-trinidad-50">
          Choose a provider to continue
        </p>
      </div>

      <ErrorMessage message={urlError} />

      {/* --- Credential-based sign-in (commented out for OAuth-only) ---
      <form action={formAction}>
        <TextInput id="email" type="email" name="email" label="Email" />
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          errors={[]}
        />

        <div>
          <ErrorMessage message={state.error || urlError} />
          <SuccessMessage message={state.message} />
          <FormSubmitButton text="Sign In" loadingText="Signing In" />
        </div>

        <Divider />
      </form>
      */}

      <OauthButtons />
    </div>
  );
}
