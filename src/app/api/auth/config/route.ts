import { NextResponse } from 'next/server'

export async function GET() {
  const authType = process.env.AUTH_TYPE || "credentials"
  
  return NextResponse.json({ 
    authType,
    // Don't expose sensitive config details to client
  })
}