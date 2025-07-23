"use server"

import { deleteSessionCookie } from "@/lib/session-utils"
import { redirect } from "next/navigation"

export async function logoutAction() {
    await deleteSessionCookie()
    redirect("/login")
}
