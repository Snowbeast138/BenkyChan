"use client";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Swal from "sweetalert2";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setUserEmail(user.email || "");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Swal.fire({
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente",
        icon: "success",
        confirmButtonColor: "#6366f1",
      });
      router.push("/login");
    } catch {
      Swal.fire("Error", "No se pudo cerrar la sesión", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">BenkyChan</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg text-sm transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Bienvenido a tu Dashboard!
            </h2>
            <p className="text-gray-600">
              Aquí puedes administrar tus temas y generar trivias.
            </p>

            <div className="mt-6">
              <Link
                href="/dashboard/trivia"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg inline-block"
              >
                Crear nueva trivia
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
