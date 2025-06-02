import { useEffect } from "react";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">BenkyChan</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </header>
      <main>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            ¡Bienvenido a BenkyChan!
          </h2>
          <p className="text-gray-700">
            Esta es la página principal. Pronto agregaremos más funcionalidades.
          </p>
        </div>
      </main>
    </div>
  );
}
