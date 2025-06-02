import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import {
  getTopicQuestions,
  updateTopicStats,
  updateUserStats,
} from "../lib/api";
import { useAuthRedirect } from "../lib/hooks/useAuthRedirect";
import { Header } from "../src/components/layout/Header";
import { Footer } from "../src/components/layout/Footer";
import { QuizStats } from "../src/components/quiz/QuizStats";
import { shuffleArray } from "../lib/utils/quizUtils";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export default function Quiz() {
  useAuthRedirect();
  const router = useRouter();
  const { topics: topicIds } = router.query;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answerHistory, setAnswerHistory] = useState<boolean[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!topicIds) return;

      try {
        const user = auth.currentUser;
        if (!user) return;

        const topicIdsArray = (topicIds as string).split(",");
        const allQuestions = await Promise.all(
          topicIdsArray.map((id) => getTopicQuestions(user.uid, id))
        );

        const flattenedQuestions = allQuestions.flat();
        const shuffledQuestions = shuffleArray(flattenedQuestions).slice(0, 10); // Limitar a 10 preguntas
        setQuestions(shuffledQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [topicIds]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;

    const isCorrect =
      selectedOption === questions[currentQuestionIndex].correctAnswer;
    setAnswerHistory([...answerHistory, isCorrect]);

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    setQuizCompleted(true);
    const user = auth.currentUser;
    if (!user || !topicIds) return;

    try {
      const topicIdsArray = (topicIds as string).split(",");
      const correctAnswers = answerHistory.filter(Boolean).length;
      const totalAnswers = answerHistory.length;

      await Promise.all([
        updateUserStats(user.uid, correctAnswers, totalAnswers),
        ...topicIdsArray.map((topicId) =>
          updateTopicStats(user.uid, topicId, correctAnswers, totalAnswers)
        ),
      ]);
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
        <Header />

        <main className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            ¡Quiz Completado!
          </h2>

          <QuizStats
            stats={{
              progress: Math.round((score / questions.length) * 100),
              quizzesTaken: [new Date()],
              correctAnswers: answerHistory,
              totalAnswers: Array(questions.length).fill(true),
            }}
          />

          <div className="mt-6">
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
        <Header />

        <main className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            No hay preguntas disponibles
          </h2>
          <p className="text-gray-600 mb-6">
            Los temas seleccionados no tienen preguntas aún. Por favor, añade
            preguntas a tus temas.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </main>

        <Footer />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <Header />

      <main className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Puntuación: {score}
          </span>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {currentQuestion.text}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                  selectedOption === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleNextQuestion}
          disabled={selectedOption === null}
          className={`w-full py-3 rounded-lg text-white ${
            selectedOption === null
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {currentQuestionIndex < questions.length - 1
            ? "Siguiente Pregunta"
            : "Finalizar Quiz"}
        </button>
      </main>

      <Footer />
    </div>
  );
}
