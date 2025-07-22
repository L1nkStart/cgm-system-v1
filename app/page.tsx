// app/page.tsx
import { redirect } from "next/navigation";

/**
 * Este es el componente de página de la ruta raíz (/).
 * Su única función es redirigir al usuario a la página de login.
 *
 * Se ejecuta en el servidor (Server Component) por defecto,
 * lo cual es ideal para redirecciones.
 */
export default function HomePage() {
    // Redirige al usuario a la página de login.
    // 'redirect' es una función de Next.js que funciona en Server Components
    // y Server Actions para realizar redirecciones del lado del servidor.
    redirect("/login");

    // Este componente no necesita renderizar nada, ya que la redirección
    // detiene el renderizado y envía una cabecera de redirección al navegador.
    return null;
}