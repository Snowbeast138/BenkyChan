import { UserStats } from "@/types";
import { ProgressBar } from "../ui/ProgressBar";
import { StatsCard } from "../ui/StatsCard";

interface QuizStatsProps {
  stats: UserStats;
  className?: string;
}

export const QuizStats = ({ stats, className = "" }: QuizStatsProps) => {
  return (
    <div
      className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-gray-100 ${className}`}
    >
      <h3 className="font-semibold text-gray-800 mb-3">Tu progreso</h3>
      <ProgressBar progress={stats.progress} />
      <div className="grid grid-cols-2 gap-4 mt-4">
        <StatsCard
          label="Respuestas"
          value={`${stats.correctAnswers}/${stats.totalAnswers}`}
        />
        <StatsCard
          label="Precisión"
          value={`${
            stats.totalAnswers > 0
              ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
              : 0
          }%`}
        />
      </div>
    </div>
  );
};
