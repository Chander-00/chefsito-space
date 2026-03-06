'use server'

// --- Credential-based auth actions (commented out for OAuth-only) ---
// To re-enable email/password auth, uncomment the code below
//
// import { signIn } from "@/auth";
// import { createUser, getUserByEmail } from "@/lib/data/user.queries";
// import { hashPassword } from "@/lib/utils/password-utils";
// import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
// import { SignInFormState, SignUpFormState } from "@/types/auth/formStates";
// import { SignUpFormSchema, SignInFormSchema } from '@/validations/auth.schema'
// import { AuthError } from "next-auth";
// import { redirect } from "next/navigation";
// import { generateVerificationToken } from "@/lib/tokens";
// import { sendVerificationEmail } from "@/lib/mail";
//
// export async function signUpAction(prevState: SignUpFormState, formData: FormData) {
//   const validatedFields = SignUpFormSchema.safeParse({
//     name: formData.get('name'),
//     username: formData.get('username'),
//     email: formData.get('email'),
//     password: formData.get('password'),
//     confirmPassword: formData.get('confirm_password'),
//   })
//
//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//       message: 'Missing Fields. Failed to create user.',
//     };
//   }
//
//   const { name, username, password, email } = validatedFields.data
//
//   try {
//     const user = await getUserByEmail({ email })
//
//     if (user) {
//       return {
//         message: 'Email already in use.'
//       }
//     }
//
//     const hashedPassword = await hashPassword(password, 10)
//
//     const userCreated = await createUser({
//       name,
//       username,
//       email,
//       password: hashedPassword
//     })
//
//     const verificationToken = await generateVerificationToken(email)
//     await sendVerificationEmail(verificationToken.email, verificationToken.token)
//
//     return {
//       success: "Confirmation Email Sent!"
//     }
//   } catch (error) {
//     console.error(error)
//   }
//
//   redirect('/auth/signin')
// }
//
// export async function authenticate(
//   prevState: SignInFormState,
//   formData: FormData,
// ) {
//   const parsedCredentials = SignInFormSchema.safeParse({
//     email: formData.get('email'),
//     password: formData.get('password'),
//   })
//
//   if (!parsedCredentials.success) {
//     return {
//       error: 'Please check your credentials'
//     } as SignInFormState
//   }
//
//   const { email, password } = parsedCredentials.data
//
//   const existingUser = await getUserByEmail({ email })
//   if (!existingUser || !existingUser.email || !existingUser.password) {
//     return {
//       error: "Email does not exists"
//     } as SignInFormState
//   }
//
//   if (!existingUser.emailVerified) {
//     const verificationToken = await generateVerificationToken(existingUser.email)
//     await sendVerificationEmail(verificationToken.email, verificationToken.token)
//     return {
//       message: "Confirmation Email Sent."
//     } as SignInFormState
//   }
//
//   try {
//     await signIn('credentials', {
//       email,
//       password,
//       redirectTo: DEFAULT_LOGIN_REDIRECT
//     });
//   } catch (error) {
//     if (error instanceof AuthError) {
//       switch (error.type) {
//         case 'CredentialsSignin':
//           return {
//             error: 'Invalid credentials.'
//           } as SignInFormState;
//         case 'CallbackRouteError':
//           return {
//             error: 'Invalid Credentials'
//           } as SignInFormState
//         default:
//           return {
//             error:'Something went wrong.'
//           } as SignInFormState;
//       }
//     }
//     throw error;
//   }
//   return {}
// }
