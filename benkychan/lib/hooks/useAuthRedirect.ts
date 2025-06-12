import { useEffect } from "react";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/router";
import { User } from "firebase/auth";

//Importa todas las dependencias necesarias

/**
 * Hook personalizado para manejar redirecciones basadas en el estado de autenticación
 * Retorna un void
 */

export const useAuthRedirect = (requiredAuth: boolean = true) => { //Indica si la ruta actual requiere autenticación
  const router = useRouter();

  useEffect(() => {
    // Suscripción a cambios en el estado de autenticación
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      // Redirige a /login si se requiere autenticación y no hay usuario
      if (requiredAuth && !user) {
        router.push("/login");
      } else if (!requiredAuth && user) { // Redirige a la raíz si no se requiere autenticación pero hay usuario logeado
        router.push("/");
      }
    });

    // Función de limpieza para desuscribirse del listener de autenticación
    return () => unsubscribe();
  }, [router, requiredAuth]); // Dependencias: router y requiredAuth
};
