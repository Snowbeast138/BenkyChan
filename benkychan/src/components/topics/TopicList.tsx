import { Topic } from "@/types";
import { TopicCard } from "./TopicCard";
import { FiPlus } from "react-icons/fi";
import Link from "next/link";

interface TopicListProps {
  topics: Topic[];
  loading: boolean;
  selectedTopics: string[];
  onTopicSelect: (id: string) => void;
}

export const TopicList = ({
  topics,
  loading,
  selectedTopics,
  onTopicSelect,
}: TopicListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          isSelected={selectedTopics.includes(topic.id)}
          onToggleSelect={onTopicSelect}
        />
      ))}
    </div>
  );
};
