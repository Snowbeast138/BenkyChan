import { FiCheck } from "react-icons/fi";
import { Topic } from "@/types";

interface TopicCardProps {
  topic: Topic;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export const TopicCard = ({
  topic,
  isSelected,
  onToggleSelect,
}: TopicCardProps) => {
  return (
    <div
      onClick={() => onToggleSelect(topic.id)}
      className={`p-5 border rounded-xl cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-blue-100 shadow-sm"
          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{topic.name}</h3>
        {isSelected ? (
          <span className="bg-blue-500 text-white p-1 rounded-full">
            <FiCheck className="text-sm" />
          </span>
        ) : null}
      </div>
      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md mb-2">
        {topic.questionCount}{" "}
        {topic.questionCount === 1 ? "pregunta" : "preguntas"}
      </span>
      {topic.lastPlayed && (
        <p className="text-xs text-gray-500 mt-2">
          Jugado:{" "}
          {new Date(
            topic.lastPlayed instanceof Date
              ? topic.lastPlayed
              : topic.lastPlayed.toDate()
          ).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};
