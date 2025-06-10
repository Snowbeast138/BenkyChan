import { FiCheck } from "react-icons/fi";
import { Topic } from "@/types";

/**
 * Props interface for TopicCard component
 */
interface TopicCardProps {
  /** Topic object containing all topic data */
  topic: Topic;
  /** Boolean indicating if the topic is currently selected */
  isSelected: boolean;
  /** Callback function to toggle topic selection */
  onToggleSelect: (id: string) => void;
}

/**
 * TopicCard Component
 * 
 * A card component that displays topic information and handles selection state.
 * 
 * Features:
 * - Interactive card with hover and selection states
 * - Displays topic name, question count and last played date
 * - Visual feedback for selected state (blue border, check icon)
 * - Responsive design with smooth transitions
 * - Handles both Date objects and Firestore Timestamps for lastPlayed
 * 
 * Accessibility:
 * - Uses cursor-pointer for interactive elements
 * - Clear visual distinction between selected/unselected states
 * - Semantic HTML structure
 * 
 * @param {TopicCardProps} props - Component props
 * @returns {JSX.Element} A clickable topic card element
 */
export const TopicCard = ({
  topic,
  isSelected,
  onToggleSelect,
}: TopicCardProps) => {
  /**
   * Formats the last played date from either Date object or Firestore Timestamp
   * @returns {string} Formatted date string or null if no date available
   */
  const formatLastPlayedDate = () => {
    if (!topic.lastPlayed) return null;
    
    try {
      const date = topic.lastPlayed instanceof Date 
        ? topic.lastPlayed 
        : topic.lastPlayed.toDate();
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting last played date:", error);
      return null;
    }
  };

  return (
    <div
      onClick={() => onToggleSelect(topic.id)}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${topic.name} - ${topic.questionCount} ${topic.questionCount === 1 ? 'pregunta' : 'preguntas'}`}
      tabIndex={0}
      className={`p-5 border rounded-xl cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-blue-100 shadow-sm"
          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
      }`}
      onKeyDown={(e) => e.key === 'Enter' && onToggleSelect(topic.id)}
    >
      {/* Header section with topic name and selection indicator */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{topic.name}</h3>
        {isSelected && (
          <span 
            className="bg-blue-500 text-white p-1 rounded-full"
            aria-hidden="true"
          >
            <FiCheck className="text-sm" />
          </span>
        )}
      </div>

      {/* Question count badge */}
      <span 
        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md mb-2"
        aria-label={`${topic.questionCount} ${topic.questionCount === 1 ? 'pregunta' : 'preguntas'}`}
      >
        {topic.questionCount} {topic.questionCount === 1 ? "pregunta" : "preguntas"}
      </span>

      {/* Last played date (conditional) */}
      {topic.lastPlayed && (
        <p className="text-xs text-gray-500 mt-2">
          Jugado: {formatLastPlayedDate()}
        </p>
      )}
    </div>
  );
};