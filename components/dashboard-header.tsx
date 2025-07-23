import { Button } from "@/components/ui/button"
import {
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu"
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
  HomeIcon,
  LineChartIcon,
  Package2Icon,
  SearchIcon,
  UsersIcon,
  MenuIcon,
  DollarSignIcon,
  FileTextIcon,
  WalletIcon,
  ClipboardListIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { getFullUserSession, hasRequiredRole } from "@/lib/auth" // Importa getFullUserSession
import { logoutAction } from "@/app/actions" // Importa la Server Action de logout
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export async function DashboardHeader() {
  const session = await getFullUserSession() // Obtiene la sesión completa del usuario
  const userRole = session?.role || "Invitado"

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: HomeIcon,
      roles: ["Superusuario", "Coordinador Regional", "Analista Concertado", "Médico Auditor", "Jefe Financiero"],
    },
    { href: "/users", label: "Usuarios", icon: UsersIcon, roles: ["Superusuario"] },
    {
      href: "/cases",
      label: "Casos",
      icon: ClipboardListIcon,
      roles: ["Superusuario", "Coordinador Regional", "Analista Concertado", "Médico Auditor"],
    },
    { href: "/cases/new", label: "Nuevo Caso", icon: XIcon, roles: ["Superusuario", "Coordinador Regional"] },
    { href: "/analyst-dashboard", label: "Dashboard Analista", icon: LineChartIcon, roles: ["Analista Concertado"] },
    { href: "/auditor-dashboard", label: "Dashboard Auditor", icon: LineChartIcon, roles: ["Médico Auditor"] },
    {
      href: "/cancelled-cases",
      label: "Casos Anulados",
      icon: XIcon,
      roles: ["Superusuario", "Coordinador Regional", "Analista Concertado", "Médico Auditor", "Jefe Financiero"],
    },
    { href: "/invoices", label: "Facturas", icon: FileTextIcon, roles: ["Superusuario", "Jefe Financiero"] },
    { href: "/incurred-fund", label: "Fondo Incurrido", icon: WalletIcon, roles: ["Superusuario", "Jefe Financiero"] },
    { href: "/payments", label: "Pagos", icon: DollarSignIcon, roles: ["Superusuario", "Jefe Financiero"] },
    { href: "/baremos", label: "Baremos", icon: ClipboardListIcon, roles: ["Superusuario", "Coordinador Regional"] },
  ]

  const filteredNavItems = navItems.filter((item) => hasRequiredRole(userRole, item.roles))

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="lg:hidden bg-transparent" size="icon" variant="outline">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <Link className="flex items-center gap-2 font-semibold" href="#">
            <Package2Icon className="h-6 w-6" />
            <span className="">CGM System</span>
          </Link>
          <div className="grid gap-2 py-6">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href={item.href}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              className="w-full bg-white shadow-none appearance-none pl-8 md:w-2/3 lg:w-1/3 dark:bg-gray-950"
              placeholder="Search..."
              type="search"
            />
          </div>
        </form>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="overflow-hidden rounded-full bg-transparent" size="icon" variant="outline">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
              <AvatarFallback>{session?.email ? session.email.charAt(0).toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{session?.email || "Mi Cuenta"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Configuración</DropdownMenuItem>
          <DropdownMenuItem>Soporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <form action={logoutAction} className="w-full">
              <button type="submit" className="w-full text-left">
                Cerrar Sesión
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
