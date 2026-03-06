/**
 * An array of routes that are public
 * these routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  '/',
  '/recipes/details/*',
  '/recipes/search'
]


/**
 * An array of routes that are used for authentication
 * These routes will redirect users to somewhere
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/signin",
  "/auth/error",
  // --- Credential-based auth routes (commented out for OAuth-only) ---
  // "/auth/signup",
  // "/auth/reset",
  // "/auth/new-password",
  // "/auth/new-verification",
]


/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication porpuses
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth"


/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/"

export const adminPrefix = "/admin"
