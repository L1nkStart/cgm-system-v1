"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  ListTodo,
  Users,
  FileText,
  DollarSign,
  ClipboardList,
  XCircle,
  Scale,
  User,
  LogOut,
  PlusCircle,
  CreditCard,
  Banknote,
  Stethoscope,
  Building2,
  UserCheck,
  Shield,
  ShieldBan,
  Building,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { logoutAction } from "@/app/actions"

import { useSidebar } from "@/components/ui/use-sidebar"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles: string[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

export function AppSidebar({
  userRole,
  userEmail,
  hide,
}: { userRole: string | null; userEmail: string | null; hide?: boolean }) {
  const pathname = usePathname()
  const { setOpen } = useSidebar()

  // Añadido para depuración:
  console.log("AppSidebar - userRole recibido:", userRole)
  console.log("AppSidebar - userEmail recibido:", userEmail)

  const navSections: NavSection[] = [
    {
      title: "Casos Médicos",
      items: [
        {
          title: "Listado de casos",
          href: "/dashboard",
          icon: ListTodo,
          roles: ["Superusuario", "Coordinador Regional", "Analista Concertado", "Médico Auditor", "Jefe Financiero"],
        },
        {
          title: "Nuevo Caso",
          href: "/cases/new",
          icon: PlusCircle,
          roles: ["Superusuario", "Coordinador Regional"],
        },
        {
          title: "Mis Casos Asignados",
          href: "/analyst-dashboard",
          icon: FileText,
          roles: ["Analista Concertado"],
        },
        {
          title: "Casos Pendientes Auditoría",
          href: "/auditor-dashboard",
          icon: ClipboardList,
          roles: ["Médico Auditor"],
        },
        {
          title: "Casos Anulados",
          href: "/cancelled-cases",
          icon: XCircle,
          roles: ["Superusuario", "Coordinador Regional", "Analista Concertado", "Médico Auditor", "Jefe Financiero"],
        },
      ],
    },
    {
      title: "Maestros",

      items: [
        {
          title: "Clientes",
          href: "/clients",
          icon: Building2,
          roles: ["Superusuario", "Jefe Financiero", "Coordinador Regional"],
        },
        {
          title: "Pacientes",
          href: "/patients",
          icon: UserCheck,
          roles: ["Superusuario", "Administrador", "Coordinador Regional", "Analista Concertado", "Médico Auditor"],
        },
        {
          title: "Titulares de Seguro",
          href: "/insurance-holders",
          icon: Shield,
          roles: ["Superusuario", "Coordinador Regional"],
        },
        {
          title: "Compañías de Seguros",
          href: "/insurance-companies",
          icon: Building,
          roles: ["Superusuario", "Jefe Financiero"],
        },
      ],

    },
    // {
    //   title: "Médicos",
    //   items: [
    //     {
    //       title: "Médicos",
    //       href: "/doctors", // Esta ruta aún no existe, es un placeholder
    //       icon: Stethoscope,
    //       roles: ["Superusuario", "Coordinador Regional"],
    //     },
    //   ],
    // },
    {
      title: "Financiero",
      items: [
        {
          title: "Facturación",
          href: "/invoices",
          icon: DollarSign,
          roles: ["Superusuario", "Jefe Financiero"],
        },
        {
          title: "Fondo Incurrido",
          href: "/incurred-fund",
          icon: CreditCard,
          roles: ["Superusuario", "Jefe Financiero"],
        },
        { title: "Pagos", href: "/payments", icon: Banknote, roles: ["Superusuario", "Jefe Financiero"] },
      ],
    },
    {
      title: "Baremos",
      items: [
        {
          title: "Baremos",
          href: "/baremos",
          icon: Scale,
          roles: ["Superusuario", "Coordinador Regional"],
        },
      ],
    },
    {
      title: "Gestión de Usuarios",
      items: [
        {
          title: "Usuarios",
          href: "/users",
          icon: Users,
          roles: ["Superusuario"],
        },
      ],
    },
  ]

  // Filtrar secciones y elementos basados en el rol del usuario
  const filteredNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => userRole && item.roles.includes(userRole)),
    }))
    .filter((section) => section.items.length > 0) // Solo mostrar secciones que tienen elementos accesibles

  // Añadido para depuración:
  console.log("AppSidebar - Secciones de navegación filtradas:", filteredNavSections)

  //logo.png

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-4">
          <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvaO09WlVAzYrDYJc_F8gz1RlQPNuWg8oJKQ&s" alt="Logo" width={40} height={40} className="rounded-full" />
          <span className="text-lg font-semibold">CGM Sistema</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {filteredNavSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User className="h-4 w-4" />
                  <span>{userEmail || "Usuario"}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-(--radix-popper-anchor-width)">
                <DropdownMenuItem>
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logoutAction()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
