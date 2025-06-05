import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";
import Link from "next/link";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

/**
 * Componente de página de inicio de sesión
 * Permite a los usuarios autenticarse con email y contraseña
 * usando Firebase Authentication
 */
export default function Login() {
  // Estados para manejar los campos del formulario y errores
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  /**
   * Maneja el envío del formulario de inicio de sesión
   * @param e - Evento del formulario
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Intenta autenticar al usuario con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Redirige a la página principal después del login exitoso
      router.push("/");
    } catch {
      // Muestra error si la autenticación falla
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    // Contenedor principal con fondo degradado
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Tarjeta blanca con sombra que contiene el formulario */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
        {/* Cabecera con degradado */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Bienvenido a <span className="text-yellow-300">BenkyChan</span>
          </h1>
          <p className="text-blue-100 mt-2">Inicia sesión para continuar</p>
        </div>

        {/* Formulario de login */}
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Campo de email */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          {/* Campo de contraseña */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Opciones adicionales: recordar usuario y recuperar contraseña */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Recordarme
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón de submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 px-4 rounded-lg shadow-md transition duration-300 flex justify-center items-center"
          >
            <span className="mr-2">Ingresar</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </form>

        {/* Enlace para redirigir a registro */}
        <div className="px-8 pb-8 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}