import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Add dynamic export to prevent static generation issues
export const dynamic = 'force-dynamic'