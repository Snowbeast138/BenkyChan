"use client";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateForm = (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    let isValid = true;

    // Validación de email
    if (!email) {
      setEmailError("El correo electrónico es requerido");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Ingresa un correo electrónico válido");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Validación de contraseña
    if (!password) {
      setPasswordError("La contraseña es requerida");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      isValid = false;
    } else {
      setPasswordError("");
    }

    // Validación de confirmación
    if (!confirmPassword) {
      setConfirmPasswordError("Confirma tu contraseña");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validar antes de enviar a Firebase
    if (!validateForm(email, password, confirmPassword)) {
      setLoading(false);
      return;
    }

    try {
      // 1. Crear usuario
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Enviar correo de verificación
      await sendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/dashboard`, // URL a la que redirige después de verificar
        handleCodeInApp: false, // Para abrir en el navegador en lugar de la app
      });

      // 3. Mostrar mensaje de éxito
      Swal.fire({
        title: "¡Registro exitoso!",
        html: `Hemos enviado un correo de verificación a <b>${email}</b>.<br><br>
               <span class="text-sm">Por favor revisa tu bandeja de entrada y la carpeta de spam.</span>`,
        icon: "success",
        confirmButtonColor: "#6366f1",
        didClose: () => {
          router.push("/login");
        },
      });

      // Opcional: Cerrar sesión para forzar verificación
      await auth.signOut();
    } catch (error: unknown) {
      console.error("Error en registro:", error);

      let errorMessage = "Error al registrarse";
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code: unknown }).code === "string"
      ) {
        switch ((error as { code: string }).code) {
          case "auth/email-already-in-use":
            errorMessage = "Este correo ya está registrado";
            break;
          case "auth/invalid-email":
            errorMessage = "Correo electrónico no válido";
            break;
          case "auth/operation-not-allowed":
            errorMessage = "Operación no permitida";
            break;
          case "auth/weak-password":
            errorMessage = "La contraseña es muy débil";
            break;
        }
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Encabezado con branding */}
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white">BenkyChan</h1>
          <p className="text-indigo-100 mt-1">Crea tu cuenta para comenzar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="tu@email.com"
              required
              className={`w-full px-4 py-2 border ${
                emailError ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña (mínimo 6 caracteres)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
              className={`w-full px-4 py-2 border ${
                passwordError ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              required
              minLength={6}
              className={`w-full px-4 py-2 border ${
                confirmPasswordError ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
            />
            {confirmPasswordError && (
              <p className="mt-1 text-sm text-red-600">
                {confirmPasswordError}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex justify-center items-center`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Registrando...
                </>
              ) : (
                "Registrarse"
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 pt-2">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Inicia Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
