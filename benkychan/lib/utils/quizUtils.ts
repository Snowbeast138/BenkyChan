import { Topic } from "../../types";

export const filterTopicsByIds = (topics: Topic[], ids: string[]): Topic[] => {
  return topics.filter((topic) => ids.includes(topic.id));
};

export const calculateQuizStats = (
  answers: boolean[]
): {
  correct: number;
  total: number;
  percentage: number;
} => {
  const correct = answers.filter(Boolean).length;
  const total = answers.length;
  return {
    correct,
    total,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
