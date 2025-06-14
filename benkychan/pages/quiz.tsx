import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import {
  getQuizQuestions,
  getUserTopics,
  updateTopicStats,
  updateUserStats,
} from "../lib/api";
import { useAuthRedirect } from "../lib/hooks/useAuthRedirect";
import { Header } from "../src/components/layout/Header";
import { Footer } from "../src/components/layout/Footer";
import { QuizStats } from "../src/components/quiz/QuizStats";
import { QuizResult } from "@/types";

/**
 * Interfaz para definir la estructura de una pregunta del quiz
 */
interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

/**
 * Componente principal de la página de Quiz
 * Maneja la lógica de preguntas, respuestas y resultados
 */
export default function Quiz() {
  // Hook personalizado para redireccionar si el usuario no está autenticado
  useAuthRedirect();
  
  const router = useRouter();
  const { topics } = router.query;
  
  // Estados del componente
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>("");
  const [validated, setValidated] = useState(false);

  /**
   * Efecto para cargar las preguntas cuando cambian los parámetros de la URL
   */
  useEffect(() => {
    const loadQuestions = async () => {
      // Verifica que los parámetros necesarios estén presentes
      if (!topics || !router.query.difficulty || !router.query.questionCount)
        return;

      // Procesa los temas (pueden venir como string o array)
      const topicArray = typeof topics === "string" ? topics.split(",") : [];
      const difficulty = router.query.difficulty as string;
      const questionCount = parseInt(router.query.questionCount as string);

      try {
        setLoading(true);
        setApiStatus(`Cargando preguntas...`);
        setError(null);

        // Obtiene los temas del usuario desde la API
        const userTopics = await getUserTopics(auth.currentUser?.uid || "");
        const selectedTopicsData = userTopics.filter((t) =>
          topicArray.includes(t.id)
        );

        // Calcula cuántas preguntas por tema (distribución proporcional)
        const questionsPerTopic = Math.max(
          1,
          Math.ceil(questionCount / selectedTopicsData.length)
        );

        // Obtiene las preguntas para cada tema en paralelo
        const allQuestions = await Promise.all(
          selectedTopicsData.map((t) =>
            getQuizQuestions(t, questionsPerTopic, difficulty)
          )
        ).then((arrays) => arrays.flat());

        // Mezcla las preguntas y selecciona la cantidad requerida
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, questionCount);

        if (selectedQuestions.length === 0) {
          setError(`No se encontraron preguntas sobre los temas seleccionados`);
        } else {
          setQuestions(selectedQuestions);
        }
      } catch (err) {
        console.error("Error loading questions:", err);
        setError("Error al cargar las preguntas. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [topics, router.query.difficulty, router.query.questionCount]);

  /**
   * Maneja la selección de una respuesta por parte del usuario
   * @param option - La opción seleccionada
   */
  const handleAnswer = (option: string) => {
    if (validated) return; // No permitir cambiar la respuesta una vez validada
    setSelectedOption(option);
    setShowExplanation(false);
  };

  /**
   * Maneja la acción del botón "Siguiente" con lógica en dos pasos:
   * 1. Validar la respuesta actual
   * 2. Avanzar a la siguiente pregunta o finalizar el quiz
   */
  const handleNext = () => {
    if (selectedOption === null) return;

    // Primera acción: validar la respuesta
    if (!validated) {
      setValidated(true);
      const isCorrect =
        selectedOption === questions[currentIndex].correctAnswer;
      if (isCorrect) setScore(score + 1);

      if (questions[currentIndex].explanation) {
        setShowExplanation(true);
      }
      return;
    }

    // Segunda acción: avanzar a la siguiente pregunta o finalizar
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setValidated(false);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  /**
   * Finaliza el quiz y guarda las estadísticas en la base de datos
   */
  const completeQuiz = async () => {
    setCompleted(true);
    const user = auth.currentUser;
    if (!user || !topics) return;

    try {
      // Calcular respuestas correctas (incluyendo la pregunta actual)
      const correctAnswers = questions.reduce((acc, q, idx) => {
        if (idx === currentIndex) {
          return acc + (selectedOption === q.correctAnswer ? 1 : 0);
        }
        return acc + 1;
      }, 0);

      // Crear objeto con los resultados del quiz
      const quizResult: QuizResult = {
        quizId: `quiz-${Date.now()}`,
        date: new Date(),
        correctAnswers: correctAnswers,
        totalQuestions: questions.length,
        score: Math.round((correctAnswers / questions.length) * 100),
        topics: typeof topics === "string" ? topics.split(",") : [],
      };

      // Actualizar estadísticas globales del usuario
      await updateUserStats(user.uid, quizResult);

      // Actualizar estadísticas por cada tema individual
      await Promise.all(
        quizResult.topics.map((topic) =>
          updateTopicStats(user.uid, topic, quizResult)
        )
      );
    } catch (err) {
      console.error("Error saving stats:", err);
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
        <Header />
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">
            {apiStatus || `Cargando preguntas...`}
          </p>
          <p className="text-sm text-gray-500">
            Esto puede tomar unos segundos
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
        <Header />
        <main className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // Quiz completado - mostrar resultados
  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
        <Header />
        <main className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <QuizStats
            score={score}
            total={questions.length}
            onRestart={() => {
              setCurrentIndex(0);
              setScore(0);
              setCompleted(false);
              setSelectedOption(null);
              setValidated(false);
            }}
            onHome={() => router.push("/")}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // No hay preguntas disponibles
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
        <Header />
        <main className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No hay preguntas
          </h2>
          <p className="text-gray-600 mb-6">
            No se encontraron preguntas para los temas seleccionados.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // Obtener pregunta actual y verificar si es la última
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  // Renderizado principal del quiz
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <Header />

      <main className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* Encabezado con número de pregunta y puntuación */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Pregunta {currentIndex + 1} de {questions.length}
          </h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            Puntuación: {score}
          </span>
        </div>

        {/* Contenedor de la pregunta y opciones */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            {currentQuestion.text}
          </h3>

          {/* Lista de opciones de respuesta */}
          <div className="space-y-3 mb-4">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                disabled={validated && selectedOption !== option}
                className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                  validated
                    ? option === currentQuestion.correctAnswer
                      ? "border-green-500 bg-green-50"
                      : selectedOption === option
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 opacity-50 cursor-not-allowed"
                    : selectedOption === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                } ${
                  validated && selectedOption !== option
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <span className="text-black">{option}</span>
              </button>
            ))}
          </div>

          {/* Explicación (si existe y está habilitada) */}
          {showExplanation && currentQuestion.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Explicación:</h4>
              <p className="text-gray-700">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        {/* Botón de acción principal (Verificar/Siguiente/Resultados) */}
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className={`w-full py-3 rounded-lg text-white ${
            !selectedOption
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {validated
            ? isLast
              ? "Ver resultados"
              : "Siguiente pregunta"
            : "Verificar respuesta"}
        </button>
      </main>

      <Footer />
    </div>
  );
}