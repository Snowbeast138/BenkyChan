import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { getUserStats, getUserTopics } from "../../lib/api";
import { Topic, UserStats } from "../../types";
import { User } from "firebase/auth";
import { useRouter } from "next/router";

//Importa todas las dependencias necesarias

/**
 * Hook personalizado para manejar los datos del usuario
 *  Retorna un objeto que contiene:
 *   - topics: Array de temas del usuario
 *   - userStats: Estadísticas del usuario
 *   - loading: Estado de carga
 */

export const useUserData = () => {
  const router = useRouter();
  // Estado para almacenar los temas del usuario
  const [topics, setTopics] = useState<Topic[]>([]);

  // Estado para las estadísticas del usuario con valores iniciales
  const [userStats, setUserStats] = useState<UserStats>({
    progress: 0,
    quizzesTaken: [],
    correctAnswers: 0,
    totalAnswers: 0,
  });

  // Estado para manejar el estado de carga
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscripción a cambios en el estado de autenticación
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      // Si no hay usuario autenticado, redirigir a login
      if (!user) {
        router.push("/login");
      } else {
        try {
          // Obtener temas y estadísticas del usuario en paralelo
          const [userTopics, stats] = await Promise.all([
            getUserTopics(user.uid),
            getUserStats(user.uid),
          ]);

          // Actualizar estados con los datos obtenidos
          setTopics(userTopics);
          setUserStats(stats);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          // Independientemente del resultado, marcar como no loading
          setLoading(false);
        }
      }
    });

    // Función de limpieza para desuscribirse del listener
    return () => unsubscribe();
  }, [router]); // Dependencia: router

  // Retornar los datos y estado de carga
  return { topics, userStats, loading };
};
