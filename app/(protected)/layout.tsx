import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarProvider } from "@/components/ui/use-sidebar" // Importa SidebarProvider
import { getFullUserSession } from "@/lib/auth" // Importa getFullUserSession
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CGM Sistema",
  description: "Sistema de gestión para CGM",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getFullUserSession() // Obtiene la sesión completa del usuario

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            <AppSidebar userRole={session?.role || null} userEmail={session?.email || null} hide={false} />
            <div
              className="flex flex-1 flex-col min-h-svh bg-background w-full overflow-x-hidden
                         md:group-[.peer]:data-[state=collapsed]:ml-[var(--sidebar-width-icon)]
                         transition-[margin-left] duration-200 ease-linear"
            >
              <DashboardHeader />
              <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-w-0 max-w-full">{children}</main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

