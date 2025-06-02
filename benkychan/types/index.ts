import { Timestamp } from "firebase/firestore";

export interface Topic {
  id: string;
  name: string;
  description?: string;
  questionCount: number;
  correctAnswers?: boolean[];
  totalAnswers?: boolean[];
  lastPlayed?: Date | Timestamp;
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
}

export interface UserStats {
  progress: number;
  quizzesTaken: Date[] | Timestamp[];
  correctAnswers: boolean[];
  totalAnswers: boolean[];
}
