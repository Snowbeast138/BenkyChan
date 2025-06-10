import { Topic } from "@/types";
import { TopicCard } from "./TopicCard";
import { FiPlus } from "react-icons/fi";
import Link from "next/link";

/**
 * Props interface for TopicList component
 */
interface TopicListProps {
  /** Array of topic objects to be displayed */
  topics: Topic[];
  /** Loading state to show spinner */
  loading: boolean;
  /** Array of selected topic IDs */
  selectedTopics: string[];
  /** Callback function when a topic is selected/unselected */
  onTopicSelect: (id: string) => void;
}

/**
 * TopicList Component
 * 
 * Displays a responsive grid of topic cards with loading and empty states.
 * 
 * Features:
 * - Responsive grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
 * - Loading state with animated spinner
 * - Empty state with call-to-action to add first topic
 * - Handles topic selection via callback
 * - Integrates with TopicCard for individual topic display
 * 
 * @param {TopicListProps} props - Component props
 * @returns {JSX.Element} Conditional render of loading spinner, empty state, or topics grid
 */
export const TopicList = ({
  topics,
  loading,
  selectedTopics,
  onTopicSelect,
}: TopicListProps) => {
  // Loading state - shows animated spinner
  if (loading) {
    return (
      <div className="flex justify-center py-12" aria-live="polite" aria-busy="true">
        <div 
          className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"
          role="status"
        >
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }

  // Empty state - shows prompt to add first topic
  if (topics.length === 0) {
    return (
      <div className="text-center py-12">
        <div 
          className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <FiPlus className="text-blue-600 text-3xl" />
        </div>
        <p className="text-gray-500 mb-6 text-lg">No tienes temas aún</p>
        <Link href="/add-topic" passHref legacyBehavior>
          <button 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Añade tu primer tema"
          >
            Añade tu primer tema
          </button>
        </Link>
      </div>
    );
  }

  // Default state - shows grid of topic cards
  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      role="list"
      aria-label="Lista de temas"
    >
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          isSelected={selectedTopics.includes(topic.id)}
          onToggleSelect={onTopicSelect}
          aria-label={`Tema: ${topic.title}`}
        />
      ))}
    </div>
  );
};