import NextAuth from "next-auth"
import authConfig from "@/auth.config"

import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { getUserById } from "./lib/data/user.queries"

// --- Credential-based auth (commented out for OAuth-only) ---
// import Credentials from "next-auth/providers/credentials"
// import { getUserByEmail } from "./lib/data/user.queries"
// import { SignInFormSchema } from '@/validations/auth.schema'
// import { passwordMatch } from "./lib/utils/password-utils"

export const {
  handlers,
  signIn,
  signOut,
  auth
} = NextAuth({
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  events: {
    async linkAccount({ user }) {
      const adminEmails = (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean)

      const isAdmin = adminEmails.includes(user.email?.toLowerCase() ?? '')

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          ...(isAdmin && { role: 'ADMIN' }),
        }
      })
    }
  },
  callbacks: {
    async signIn({ account }) {
      // OAuth providers don't require email verification
      if (account?.provider !== 'credentials') return true

      // --- Credential-based auth (commented out for OAuth-only) ---
      // const existingUser = await getUserById(user.id as string)
      // if (!existingUser?.emailVerified) return false

      return true
    },

    async session({ token, session }) {

      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role
      }

      return session
    },
    async jwt({ token }) {
      if(!token.sub) return token

      const existingUser = await getUserById(token.sub)

      if(!existingUser) return token

      token.role = existingUser.role

      return token
    }
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  // --- Credential-based auth (commented out for OAuth-only) ---
  // To re-enable, uncomment the Credentials provider below and the imports above
  // providers: [
  //   ...authConfig.providers,
  //   Credentials({
  //     async authorize(credentials) {
  //       const parsedCredentials = SignInFormSchema.safeParse(credentials)
  //       if (parsedCredentials.success) {
  //         const {email, password} = parsedCredentials.data
  //         const user = await getUserByEmail({email});
  //
  //         if (!user || !user.password) return null
  //
  //         const match = await passwordMatch(password, user.password)
  //
  //         if (match) return user
  //       }
  //
  //       return null
  //     }
  //   })
  // ]
})
