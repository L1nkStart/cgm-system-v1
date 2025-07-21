import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (session) {
    return NextResponse.json({ role: session.role })
  }
  return NextResponse.json({ role: null }, { status: 401 })
}
