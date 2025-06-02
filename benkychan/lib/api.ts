import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  arrayUnion,
  query,
} from "firebase/firestore";
import { Topic, Question, UserStats } from "../types";

export const getUserTopics = async (userId: string): Promise<Topic[]> => {
  const topicsSnapshot = await getDocs(
    query(collection(db, "users", userId, "topics"))
  );
  return topicsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    lastPlayed: doc.data().lastPlayed?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Topic[];
};

export const addTopic = async (
  userId: string,
  topicData: Omit<Topic, "id">
): Promise<void> => {
  await addDoc(collection(db, "users", userId, "topics"), topicData);
};

export const getTopicQuestions = async (
  userId: string,
  topicId: string
): Promise<Question[]> => {
  const questionsSnapshot = await getDocs(
    collection(db, "users", userId, "topics", topicId, "questions")
  );
  return questionsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Question[];
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  const statsDoc = await getDoc(doc(db, "users", userId, "stats", "progress"));
  return statsDoc.exists()
    ? (statsDoc.data() as UserStats)
    : {
        progress: 0,
        quizzesTaken: [],
        correctAnswers: [],
        totalAnswers: [],
      };
};

export const updateUserStats = async (
  userId: string,
  correctAnswers: number,
  totalAnswers: number
): Promise<void> => {
  const statsRef = doc(db, "users", userId, "stats", "progress");
  await updateDoc(statsRef, {
    quizzesTaken: arrayUnion(new Date()),
    correctAnswers: arrayUnion(...Array(correctAnswers).fill(true)),
    totalAnswers: arrayUnion(...Array(totalAnswers).fill(true)),
    progress: calculateNewProgress(correctAnswers, totalAnswers),
  });
};

export const updateTopicStats = async (
  userId: string,
  topicId: string,
  correctAnswers: number,
  totalAnswers: number
): Promise<void> => {
  const topicRef = doc(db, "users", userId, "topics", topicId);
  await updateDoc(topicRef, {
    lastPlayed: new Date(),
    questionCount: arrayUnion(...Array(totalAnswers).fill(null)), // Simulamos preguntas añadidas
    correctAnswers: arrayUnion(...Array(correctAnswers).fill(true)),
    totalAnswers: arrayUnion(...Array(totalAnswers).fill(true)),
  });
};

const calculateNewProgress = (correct: number, total: number): number => {
  // Lógica para calcular el nuevo progreso basado en respuestas correctas
  return Math.min(100, Math.round((correct / total) * 100));
};
