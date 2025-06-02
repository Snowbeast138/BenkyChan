import { Timestamp } from "firebase/firestore";

export interface Topic {
  id: string;
  name: string;
  userId: string;
  createdAt: Timestamp | Date;
  questionCount: number;
  lastPlayed?: Timestamp | Date;
  questions?: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  topicId: string;
  createdAt: Timestamp | Date;
}

export interface UserStats {
  progress: number;
  quizzesTaken: number;
  lastPlayed?: Timestamp | Date;
  correctAnswers: number;
  totalAnswers: number;
}

export interface QuizParams {
  topics: string[];
  questionCount?: number;
  difficulty?: "easy" | "medium" | "hard";
}
