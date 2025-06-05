import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import Link from "next/link";
import { getUserStats, getUserTopics } from "../lib/api";
import { Topic, UserStats } from "../types";
import { User } from "firebase/auth";
import {
  FiLogOut,
  FiPlus,
  FiCheck,
  FiX,
  FiAward,
  FiBarChart2,
  FiBookOpen,
} from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userStats, setUserStats] = useState<UserStats>({
    progress: 0,
    quizzesTaken: [],
    correctAnswers: 0,
    totalAnswers: 0,
  });
  const [difficulty, setDifficulty] = useState<string>("mixed");
  const [questionCount, setQuestionCount] = useState<number>(10);

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
      query: {
        topics: selectedTopics.join(","),
        difficulty,
        questionCount,
      },
    });
  };

  const mixAllTopics = (): void => {
    setSelectedTopics(topics.map((t) => t.id));
  };

  const calculateTopicProgress = (topic: Topic): number => {
    if (!topic.correctAnswers || !topic.totalAnswers) return 0;
    if (topic.totalAnswers.length === 0) return 0;
    return Math.round(
      (topic.correctAnswers.length / topic.totalAnswers.length) * 100
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <FiAward className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-800">BenkyChan</h1>
            <p className="text-gray-600">Aprende a Aprender</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 border border-red-100 transition-colors"
        >
          <FiLogOut />
          Cerrar Sesión
        </button>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Topics Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Tus Temas de Estudio
            </h2>
            <Link href="/add-topic">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <FiPlus />
                Añadir Tema
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FiPlus className="text-blue-600 text-3xl" />
              </div>
              <p className="text-gray-500 mb-6 text-lg">No tienes temas aún</p>
              <Link href="/add-topic">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Añade tu primer tema
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => {
                const progress = calculateTopicProgress(topic);
                const correctCount = topic.correctAnswers?.length || 0;
                const totalCount = topic.totalAnswers?.length || 0;

                return (
                  <div
                    key={topic.id}
                    onClick={() => toggleTopicSelection(topic.id)}
                    className={`p-5 border rounded-xl cursor-pointer transition-all relative overflow-hidden ${
                      selectedTopics.includes(topic.id)
                        ? "border-blue-500 bg-blue-50 shadow-blue-100 shadow-sm"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    {/* Barra de progreso */}
                    <div
                      className="absolute bottom-0 left-0 h-1 bg-blue-200"
                      style={{ width: `${progress}%` }}
                    ></div>

                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {topic.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {selectedTopics.includes(topic.id) && (
                          <span className="bg-blue-500 text-white p-1 rounded-full">
                            <FiCheck className="text-sm" />
                          </span>
                        )}
                        <span className="text-xs font-medium text-gray-500">
                          {progress}%
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-1">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md">
                        {topic.questionCount}{" "}
                        {topic.questionCount === 1 ? "pregunta" : "preguntas"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {correctCount}/{totalCount} correctas
                      </span>
                    </div>

                    {topic.lastPlayed && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Último quiz:{" "}
                          {new Date(
                            topic.lastPlayed instanceof Date
                              ? topic.lastPlayed
                              : topic.lastPlayed.toDate()
                          ).toLocaleDateString()}
                        </p>
                        {topic.lastScore !== undefined && (
                          <p className="text-xs font-medium mt-1">
                            Puntaje:{" "}
                            <span
                              className={
                                topic.lastScore >= 70
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {topic.lastScore}%
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6 h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Crear Trivia
          </h2>

          {/* Selector de dificultad */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dificultad
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-black text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="mixed">Mixta</option>
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
          </div>

          {/* Selector de cantidad de preguntas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de preguntas
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg bg-black text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiBarChart2 />
              Temas seleccionados
            </h3>
            {selectedTopics.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">
                  Selecciona al menos un tema de la lista
                </p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {topics
                  .filter((t) => selectedTopics.includes(t.id))
                  .map((topic) => (
                    <li
                      key={topic.id}
                      className="flex justify-between items-center bg-blue-50/50 rounded-lg px-3 py-2 border border-blue-100"
                    >
                      <div>
                        <span className="text-gray-700">{topic.name}</span>
                        <span className="block text-xs text-gray-500">
                          {calculateTopicProgress(topic)}% completado
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTopicSelection(topic.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      >
                        <FiX />
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={startQuiz}
              disabled={selectedTopics.length === 0}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                selectedTopics.length === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <FiAward />
              Iniciar Trivia ({selectedTopics.length}{" "}
              {selectedTopics.length === 1 ? "tema" : "temas"})
            </button>

            <button
              onClick={mixAllTopics}
              disabled={topics.length === 0}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                topics.length === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <FiBarChart2 />
              Mezclar Todos los Temas
            </button>

            <button
              onClick={() => {
                if (selectedTopics.length === 0) {
                  alert("Por favor selecciona al menos un tema");
                  return;
                }
                router.push({
                  pathname: "/learn-path",
                  query: {
                    topics: selectedTopics.join(","),
                  },
                });
              }}
              disabled={selectedTopics.length === 0}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                selectedTopics.length === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <FiBookOpen />
              Ruta de Aprendizaje ({selectedTopics.length}{" "}
              {selectedTopics.length === 1 ? "tema" : "temas"})
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Tu progreso</h3>
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Completado
              </span>
              <span className="text-sm font-bold text-blue-600">
                {userStats.progress}%
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                style={{ width: `${userStats.progress}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500">Respuestas</p>
                <p className="font-bold text-gray-800">
                  {userStats.correctAnswers}/{userStats.totalAnswers}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500">Precisión</p>
                <p className="font-bold text-gray-800">
                  {userStats.totalAnswers > 0
                    ? Math.round(
                        (userStats.correctAnswers / userStats.totalAnswers) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm pb-8">
        <p>BenkyChan - Aprende jugando © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
