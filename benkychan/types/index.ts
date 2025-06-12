import { Timestamp } from "firebase/firestore";

export interface QuizResult {
  quizId: string;
  date: Date | Timestamp;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  topics: string[];
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  questionCount: number;
  correctAnswers?: boolean[];
  totalAnswers?: boolean[];
  lastPlayed?: Date | Timestamp;
  lastScore?: number;
  quizHistory?: QuizResult[];
  createdAt: Date | Timestamp;
  category?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  topicId?: string;
  difficulty?: string; // 'easy', 'medium', 'hard'
}

export interface UserStats {
  progress: number;
  quizzesTaken: QuizResult[];
  correctAnswers: number;
  totalAnswers: number;
}

export interface RelatedTopic {
  id: string;
  name: string;
  relationType: "fundamental" | "indirect";
  weight: number; // Peso de la relación (1-10)
}

export interface KnowledgeGraph {
  nodes: {
    id: string;
    name: string;
    difficulty: "easy" | "medium" | "hard";
  }[];
  links: {
    // Cambiado de 'edges' a 'links'
    source: string;
    target: string;
    weight: number;
    type: "fundamental" | "indirect";
  }[];
}
