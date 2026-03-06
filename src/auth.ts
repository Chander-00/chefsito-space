import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import authConfig from "@/auth.config"

import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { getUserByEmail, getUserById } from "./lib/data/user.queries"
import { SignInFormSchema } from '@/validations/auth.schema'
import { passwordMatch } from "./lib/utils/password-utils"

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
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow oauth without email verification
      if (account?.provider !== 'credentials') return true

      const existingUser = await getUserById(user.id as string)

      //Prevent sign in without email verification
      // This will only work / be uncomented on DEV until we got a domain :(
      if (!existingUser?.emailVerified) return false

      return true
    },

    async session({ user, token, session }) {

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
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = SignInFormSchema.safeParse(credentials)
        if (parsedCredentials.success) {
          const {email, password} = parsedCredentials.data
          const user = await getUserByEmail({email});

          if (!user || !user.password) return null

          const match = await passwordMatch(password, user.password)

          if (match) return user
        }

        return null
      }
    })
  ]
})
