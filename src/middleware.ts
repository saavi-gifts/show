import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    console.log("Middleware - Token:", !!req.nextauth.token, "Path:", req.nextUrl.pathname)
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log("Middleware authorized check - Token:", !!token, "Path:", req.nextUrl.pathname)
        // Always allow access if token exists
        if (token) return true
        
        // For static deployment, check if we're trying to access protected routes
        // In static mode, middleware runs but NextAuth tokens might not work properly
        const isStaticMode = process.env.NODE_ENV === 'production'
        if (isStaticMode) {
          console.log("Static mode - allowing access to check client-side auth")
          return true // Let the page handle auth client-side
        }
        
        return !!token
      },
    },
  }
)

export const config = {
  matcher: []  // Temporarily disable middleware to test
}