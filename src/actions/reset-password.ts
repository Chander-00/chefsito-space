"use server"

// --- Credential-based auth (commented out for OAuth-only) ---
// import { getUserByEmail } from "@/lib/data/user.queries"
// import { sendPasswordResetEmail } from "@/lib/mail"
// import { generatePasswordResetToken } from "@/lib/tokens"
// import { ResetFormState } from "@/types/auth/formStates"
// import { ResetSchema } from "@/validations/auth.schema"
//
// export const resetAction = async (prevState: ResetFormState, formData: FormData): Promise<ResetFormState> => {
//   const validatedFields = ResetSchema.safeParse({
//     email: formData.get('email')
//   })
//
//   if(!validatedFields.success) {
//     return {
//       error: 'Invalid Email',
//       message: null,
//     };
//   }
//
//   const { email } = validatedFields.data
//
//   const existingUser = getUserByEmail({ email })
//
//   if(!existingUser) {
//     return {
//       message: null,
//       error: 'Email not found'
//     }
//   }
//
//   const passwordResetToken = await generatePasswordResetToken(email)
//   await sendPasswordResetEmail(
//     passwordResetToken.email,
//     passwordResetToken.token
//   )
//
//   return {
//     message: 'Verification email sent.',
//     error: null
//   }
// }
