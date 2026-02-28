/**
 * An array of routes that are public
 * these routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  '/',
  '/auth/new-verification',
  '/recipes/details/*',
  '/recipes/search'
]


/**
 * An array of routes that are used for authentication
 * These routes will redirect users to somewhere 
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/signup",
  "/auth/signin",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password"
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