import { Topic } from "@/types";
import { UserStats } from "@/types";
import { FiAward, FiBarChart2, FiX } from "react-icons/fi";
import { ProgressBar } from "../ui/ProgressBar";
import { StatsCard } from "../ui/StatsCard";

interface QuizPanelProps {
  topics: Topic[];
  selectedTopics: string[];
  userStats: UserStats;
  onStartQuiz: () => void;
  onMixAllTopics: () => void;
  onDeselectTopic: (id: string) => void;
}

export const QuizPanel = ({
  topics,
  selectedTopics,
  userStats,
  onStartQuiz,
  onMixAllTopics,
  onDeselectTopic,
}: QuizPanelProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6 h-fit">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Trivia</h2>

      <div className="mb-8">
        <h3 className="font-semibold text-gray-700 mb-3">
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
                  <span className="text-gray-700">{topic.name}</span>
                  <button
                    onClick={() => onDeselectTopic(topic.id)}
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
          onClick={onStartQuiz}
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
          onClick={onMixAllTopics}
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
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Tu progreso</h3>
        <ProgressBar progress={userStats.progress} />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <StatsCard
            label="Respuestas"
            value={`${userStats.correctAnswers}/${userStats.totalAnswers}`}
          />
          <StatsCard
            label="Precisión"
            value={`${
              typeof userStats.totalAnswers === "number" &&
              userStats.totalAnswers > 0
                ? Math.round(
                    (Number(userStats.correctAnswers) /
                      Number(userStats.totalAnswers)) *
                      100
                  )
                : 0
            }%`}
          />
        </div>
      </div>
    </div>
  );
};
