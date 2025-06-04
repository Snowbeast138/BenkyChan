import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { getTopicDetails, getTopicQuestions } from "../lib/api";
import { Topic, Question } from "../types";
import Link from "next/link";
import { FiArrowLeft, FiBookOpen, FiCheck } from "react-icons/fi";

export default function LearnPath() {
  const router = useRouter();
  const { topics: topicsQuery } = router.query;
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!topicsQuery || !auth.currentUser) return;

    const loadTopicsAndQuestions = async () => {
      try {
        const topicIds = (topicsQuery as string).split(",");
        const userId = auth.currentUser!.uid; // Obtenemos el userId del usuario autenticado

        // Cargar detalles de los temas (ahora pasando ambos argumentos)
        const topicDetails = await Promise.all(
          topicIds.map((id) => getTopicDetails(userId, id)) // Pasar userId y topicId
        );
        const validTopics = topicDetails.filter((t): t is Topic => t !== null);
        setTopics(validTopics);

        // Cargar preguntas para cada tema
        const questionsData: Record<string, Question[]> = {};
        for (const topic of validTopics) {
          const topicQuestions = await getTopicQuestions(
            userId, // Usar el mismo userId aquí
            topic.id
          );
          questionsData[topic.id] = topicQuestions;
        }
        setQuestions(questionsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
        setLoadingQuestions(false);
      }
    };

    loadTopicsAndQuestions();
  }, [topicsQuery]);

  const calculateTopicProgress = (topic: Topic): number => {
    if (!topic.correctAnswers || !topic.totalAnswers) return 0;
    if (topic.totalAnswers.length === 0) return 0;
    return Math.round(
      (topic.correctAnswers.length / topic.totalAnswers.length) * 100
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 border border-blue-100 transition-colors">
              <FiArrowLeft />
              Volver
            </button>
          </Link>
          <div className="bg-green-600 text-white p-2 rounded-lg">
            <FiBookOpen className="text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Temas Seleccionados
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Contenido de los Temas
          </h2>

          {topics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay temas seleccionados</p>
            </div>
          ) : (
            <div className="space-y-8">
              {topics.map((topic) => (
                <div key={topic.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {topic.name}
                      </h3>
                      <p className="text-gray-600">{topic.description}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {calculateTopicProgress(topic)}% completado
                    </span>
                  </div>

                  {loadingQuestions ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Preguntas ({questions[topic.id]?.length || 0})
                      </h4>

                      {questions[topic.id]?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {questions[topic.id].map(
                            (
                              question // Eliminé el parámetro index que no se usaba
                            ) => (
                              <div
                                key={`${topic.id}-${question.id}`}
                                className="border p-4 rounded-lg hover:bg-white transition-colors"
                              >
                                <p className="font-medium mb-2">
                                  {question.text}
                                </p>
                                <ul className="space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <li
                                      key={optIndex}
                                      className={`flex items-center gap-2 text-sm ${
                                        option === question.correctAnswer
                                          ? "text-green-600 font-medium"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      <FiCheck
                                        className={
                                          option === question.correctAnswer
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }
                                      />
                                      {option}
                                    </li>
                                  ))}
                                </ul>
                                {question.explanation && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    <span className="font-medium">
                                      Explicación:
                                    </span>{" "}
                                    {question.explanation}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Este tema no tiene preguntas aún
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
