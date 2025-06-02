import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
  getDoc,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { Topic, Question, UserStats } from "../types";

// Helper para convertir documentos de Firestore
const converter = <T>() => ({
  toFirestore: (data: T) => {
    // Convertir Dates a Timestamps
    const convertedData: Record<string, unknown> = {
      ...(data as Record<string, unknown>),
    };
    for (const key in convertedData) {
      if (convertedData[key] instanceof Date) {
        convertedData[key] = Timestamp.fromDate(convertedData[key]);
      }
    }
    return convertedData;
  },
  fromFirestore: (snap: QueryDocumentSnapshot<DocumentData>) => {
    const data = snap.data();
    // Convertir Timestamps a Dates
    for (const key in data) {
      if (data[key] instanceof Timestamp) {
        data[key] = data[key].toDate();
      }
    }
    return data as T;
  },
});

// Colecciones con conversores de tipo
const topicsCollection = collection(db, "topics").withConverter(
  converter<Topic>()
);
const statsCollection = collection(db, "stats").withConverter(
  converter<UserStats>()
);

export const getUserTopics = async (userId: string): Promise<Topic[]> => {
  const q = query(topicsCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      // No necesitas llamar a toDate() aquí porque el converter ya lo hizo
    };
  });
};

export const addTopic = async (
  userId: string,
  topicName: string
): Promise<Topic> => {
  const newTopic: Omit<Topic, "id"> = {
    name: topicName,
    userId,
    createdAt: new Date(),
    questionCount: 0,
  };
  const docRef = await addDoc(topicsCollection, newTopic);
  return { id: docRef.id, ...newTopic };
};

export const generateQuestions = async (
  topicId: string,
  topicName: string,
  count: number = 5
): Promise<Question[]> => {
  const response = await fetch("/api/generate-questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: topicName,
      count,
    }),
  });

  const questions: Question[] = await response.json();
  const questionsWithDates = questions.map((q) => ({
    ...q,
    createdAt: new Date(),
    topicId,
  }));

  const topicRef = doc(topicsCollection, topicId);
  await updateDoc(topicRef, {
    questions: arrayUnion(...questionsWithDates),
    questionCount: questions.length,
    lastPlayed: new Date(),
  });

  return questionsWithDates;
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  const statsRef = doc(statsCollection, userId);
  const snapshot = await getDoc(statsRef);

  if (!snapshot.exists()) {
    const defaultStats: UserStats = {
      progress: 0,
      quizzesTaken: 0,
      correctAnswers: 0,
      totalAnswers: 0,
    };
    // Use setDoc to create the document if it doesn't exist
    const { setDoc } = await import("firebase/firestore");
    await setDoc(statsRef, defaultStats);
    return defaultStats;
  }

  return snapshot.data();
};
