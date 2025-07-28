import { NextResponse } from "next/server"
import { getFullUserSession } from "@/lib/auth"

export async function GET() {
  const session = await getFullUserSession()
  if (session) {
    return NextResponse.json({ role: session.role, userId: session.id })
  }
  return NextResponse.json({ role: null }, { status: 401 })
}
