"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Container } from "@/components/Container"
import { getApiPath } from "@/lib/utils"

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [authType, setAuthType] = useState<string>("")
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [sessionChecked, setSessionChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Prevent multiple session checks that could cause loops
    if (sessionChecked) return
    
    document.title = "Loading Auth..."
    console.log("AdminLogin useEffect triggered")
    
    // Check for callbackUrl in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const callbackUrl = urlParams.get('callbackUrl')
    console.log("Callback URL found:", callbackUrl)
    
    // Get auth type from server - fallback to credentials if API not available
    fetch(getApiPath("/api/auth/config"))
      .then(res => {
        console.log("Auth config response:", res.status)
        return res.json()
      })
      .then(data => {
        console.log("Auth config data:", data)
        setAuthType(data.authType)
        document.title = `Auth: ${data.authType}`
      })
      .catch((error) => {
        console.log("Auth config fetch error:", error)
        // In static export, API routes aren't available, default to credentials
        setAuthType("credentials")
        document.title = "Auth: credentials (fallback)"
      })

    // Only check session once to prevent loops
    if (!sessionChecked) {
      setSessionChecked(true)
      document.title = "Checking session..."
      
      getSession().then((session) => {
        console.log("Current session:", session)
        if (session) {
          document.title = "Redirecting..."
          console.log("Session exists, redirecting")
          // Use the callback URL if available, otherwise default to /admin/gifts
          const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : "/admin/gifts"
          console.log("Redirecting to:", redirectUrl)
          router.replace(redirectUrl)
        } else {
          document.title = "Admin Login"
        }
      }).catch((error) => {
        // Session management not available in static export
        console.log("Session check error:", error)
        document.title = "Admin Login (no session)"
      })
    }
  }, [])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      const result = await signIn("google", {
        callbackUrl: "/admin/gifts",
        redirect: false,
      })
      
      if (result?.ok) {
        router.push("/admin/gifts")
      } else if (result?.error) {
        setError("Google sign-in failed")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("Sign-in failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Credentials sign-in initiated")
    setIsLoading(true)
    setError("")

    try {
      // Check if we're in static export mode (GitHub Pages)
      if (process.env.GITHUB_ACTIONS) {
        console.log("Using static export auth")
        // Simple client-side validation for static deployment
        const validUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin"
        const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"
        
        if (credentials.username === validUsername && credentials.password === validPassword) {
          // Store a simple flag in localStorage for static deployment
          localStorage.setItem('saavi_admin_authenticated', 'true')
          console.log("Static auth successful, redirecting")
          router.push("/admin/gifts")
        } else {
          setError("Invalid username or password")
        }
      } else {
        console.log("Using NextAuth credentials")
        // Use NextAuth for development/server environments
        const result = await signIn("credentials", {
          username: credentials.username,
          password: credentials.password,
          redirect: false,
        })

        console.log("NextAuth result:", result)
        if (result?.ok) {
          console.log("NextAuth successful, redirecting")
          // Check for callback URL in current page
          const urlParams = new URLSearchParams(window.location.search)
          const callbackUrl = urlParams.get('callbackUrl')
          const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : "/admin/gifts"
          console.log("Redirecting to:", redirectUrl)
          router.replace(redirectUrl)
        } else {
          console.log("NextAuth failed:", result?.error)
          setError("Invalid username or password")
        }
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("Sign-in failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white font-playfair">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Access the gift management dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="mt-8 space-y-6">
            {authType === "google" && (
              <div className="rounded-md shadow-sm">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-saavi-brown hover:bg-saavi-brown-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saavi-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-saavi-gold group-hover:text-saavi-gold-light"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </span>
                  {isLoading ? "Signing in..." : "Sign in with Google"}
                </button>
              </div>
            )}

            {authType === "credentials" && (
              <form onSubmit={handleCredentialsSignIn} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter username"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-saavi-brown hover:bg-saavi-brown-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saavi-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}

            {!authType && (
              <div className="text-center text-gray-500">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}