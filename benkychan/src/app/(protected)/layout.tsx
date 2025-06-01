import { auth } from "@/lib/firebase";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await auth.currentUser;

  if (!user) {
    redirect("/login"); // Si no está autenticado
  }

  return (
    <div className="min-h-screen">
      {/* Aquí iría tu navbar */}
      <div className="container mx-auto p-4">
        {children} {/* Renderiza dashboard/páginas protegidas */}
      </div>
    </div>
  );
}
