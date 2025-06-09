import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

/**
 * Componente de página de registro
 * Permite a los usuarios crear una nueva cuenta mediante email y contraseña
 * utilizando Firebase Authentication
 */
export default function Register() {
  // Estados para manejar los campos del formulario y errores
  const [email, setEmail] = useState(""); // Estado para el email
  const [password, setPassword] = useState(""); // Estado para la contraseña
  const [username, setUsername] = useState(""); // Estado para el nombre de usuario
  const [error, setError] = useState(""); // Estado para mensajes de error
  const router = useRouter(); // Hook de Next.js para manejar rutas

  /**
   * Maneja el envío del formulario de registro
   * @param e - Evento del formulario
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    
    try {
      // Intenta crear un nuevo usuario con Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirige a la página principal después del registro exitoso
      router.push("/");
    } catch {
      // Muestra error si el registro falla (email ya en uso, contraseña débil, etc.)
      setError("Error al registrarse. Intenta con otro correo.");
    }
  };

  return (
    // Contenedor principal con fondo degradado
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Tarjeta blanca con sombra que contiene el formulario */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
        {/* Cabecera con degradado */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Únete a <span className="text-yellow-300">BenkyChan</span>
          </h1>
          <p className="text-indigo-100 mt-2">Crea tu cuenta en segundos</p>
        </div>

        {/* Formulario de registro */}
        <form onSubmit={handleRegister} className="p-8 space-y-6">
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

          {/* Campo de nombre de usuario */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Nombre de usuario
            </label>
            <div className="relative">
              {/* Icono de usuario */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                placeholder="benkyfan"
                required
              />
            </div>
          </div>

          {/* Campo de email */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <div className="relative">
              {/* Icono de email */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
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
              {/* Icono de candado */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                placeholder="••••••••"
                required
                minLength={6} // Firebase requiere mínimo 6 caracteres
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          {/* Botón de submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white py-3 px-4 rounded-lg shadow-md transition duration-300 flex justify-center items-center"
          >
            <span className="mr-2">Registrarse</span>
            {/* Icono de check */}
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </form>

        {/* Enlace para redirigir a login */}
        <div className="px-8 pb-8 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}