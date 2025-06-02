import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import Link from "next/link";
import { getUserStats, getUserTopics } from "../lib/api";
import { Topic, UserStats } from "../types";
import { User } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userStats, setUserStats] = useState<UserStats>({
    progress: 0,
    quizzesTaken: 0,
    correctAnswers: 0,
    totalAnswers: 0,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (!user) {
        router.push("/login");
      } else {
        try {
          const [userTopics, stats] = await Promise.all([
            getUserTopics(user.uid),
            getUserStats(user.uid),
          ]);
          setTopics(userTopics);
          setUserStats(stats);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async (): Promise<void> => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const toggleTopicSelection = (topicId: string): void => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const startQuiz = (): void => {
    if (selectedTopics.length === 0) {
      alert("Por favor selecciona al menos un tema");
      return;
    }
    router.push({
      pathname: "/quiz",
      query: { topics: selectedTopics.join(",") },
    });
  };

  const mixAllTopics = (): void => {
    setSelectedTopics(topics.map((t) => t.id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">BenkyChan</h1>
          <p className="text-gray-600">Aprende mediante trivias interactivas</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics Section */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tus Temas de Estudio</h2>
            <Link href="/add-topic">
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                + Añadir Tema
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tienes temas aún</p>
              <Link href="/add-topic">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Añade tu primer tema
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => toggleTopicSelection(topic.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTopics.includes(topic.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{topic.name}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {topic.questionCount} preguntas
                    </span>
                  </div>
                  {topic.lastPlayed && (
                    <p className="text-xs text-gray-500 mt-1">
                      Jugado: {new Date(topic.lastPlayed).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Crear Trivia</h2>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Temas seleccionados:</h3>
            {selectedTopics.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Selecciona al menos un tema
              </p>
            ) : (
              <ul className="space-y-1">
                {topics
                  .filter((t) => selectedTopics.includes(t.id))
                  .map((topic) => (
                    <li
                      key={topic.id}
                      className="flex justify-between items-center"
                    >
                      <span>{topic.name}</span>
                      <button
                        onClick={() => toggleTopicSelection(topic.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={startQuiz}
              disabled={selectedTopics.length === 0}
              className={`w-full py-3 rounded ${
                selectedTopics.length === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Iniciar Trivia ({selectedTopics.length} temas)
            </button>

            <button
              onClick={mixAllTopics}
              disabled={topics.length === 0}
              className={`w-full py-3 rounded ${
                topics.length === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-purple-500 hover:bg-purple-600 text-white"
              }`}
            >
              Mezclar Todos los Temas
            </button>
          </div>

          <div className="mt-8">
            <h3 className="font-medium mb-2">Tu progreso</h3>
            <div className="bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${userStats.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {userStats.progress}% de completado ({userStats.correctAnswers}/
              {userStats.totalAnswers} respuestas correctas)
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>BenkyChan - Aprende jugando © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
