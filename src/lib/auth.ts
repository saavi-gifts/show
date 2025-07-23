import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const authType = process.env.AUTH_TYPE || "credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    ...(authType === "google" ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      }),
    ] : []),
    ...(authType === "credentials" ? [
      CredentialsProvider({
        name: "Admin Login",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          const adminUsername = process.env.ADMIN_USERNAME || process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin"
          const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"
          
          if (
            credentials?.username === adminUsername &&
            credentials?.password === adminPassword
          ) {
            return {
              id: "1",
              name: "Admin",
              email: "admin@saavi.com",
            }
          }
          return null
        },
      }),
    ] : []),
  ],
  pages: {
    signIn: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/admin/login`,
  },
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async jwt({ token, user }) {
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-for-development-only",
}

export { authType }