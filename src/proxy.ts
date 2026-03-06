import NextAuth from "next-auth"

import authConfig from "@/auth.config"
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes
} from '@/routes'

const { auth } = NextAuth(authConfig)

const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(publicRoute => {
    const regex = new RegExp(`^${publicRoute.replace('*', '.*')}$`);
    return regex.test(pathname);
  });
};

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublic = isPublicRoute(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  if (isApiAuthRoute) {
    return
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return
  }

  if (!isLoggedIn && !isPublic) {
    return Response.redirect(new URL("/auth/signin", nextUrl))
  }

  return
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
