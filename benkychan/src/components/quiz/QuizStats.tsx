import { FiHome, FiRepeat } from "react-icons/fi";
import { UserStats } from "@/types";
import { ProgressBar } from "../ui/ProgressBar";
import { StatsCard } from "../ui/StatsCard";

interface QuizStatsProps {
  // Opción 1: Pasar stats completo
  stats?: UserStats;
  // Opción 2: Pasar valores individuales
  score?: number;
  total?: number;
  // Funciones
  onRestart?: () => void;
  onHome?: () => void;
  className?: string;
}

export const QuizStats = ({
  stats,
  score,
  total,
  onRestart,
  onHome,
  className = "",
}: QuizStatsProps) => {
  // Calcular valores basados en qué props se proporcionaron
  const correctCount =
    score ??
    (Array.isArray(stats?.correctAnswers)
      ? stats?.correctAnswers.length
      : stats?.correctAnswers ?? 0);

  const totalCount =
    total ??
    (Array.isArray(stats?.totalAnswers)
      ? stats?.totalAnswers.length
      : stats?.totalAnswers ?? 0);

  const progress =
    stats?.progress ??
    (totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0);

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800">¡Quiz Completado!</h2>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700">Puntuación:</span>
          <span className="text-xl font-bold text-blue-600">
            {correctCount} / {totalCount}
          </span>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar progress={progress} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <StatsCard
            label="Respuestas"
            value={`${correctCount}/${totalCount}`}
          />
          <StatsCard
            label="Precisión"
            value={`${
              totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
            }%`}
          />
        </div>
      </div>

      {(onRestart || onHome) && (
        <div className="grid grid-cols-2 gap-4">
          {onRestart && (
            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRepeat /> Reintentar
            </button>
          )}
          {onHome && (
            <button
              onClick={onHome}
              className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiHome /> Inicio
            </button>
          )}
        </div>
      )}
    </div>
  );
};
