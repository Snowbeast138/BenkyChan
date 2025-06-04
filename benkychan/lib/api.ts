import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  arrayUnion,
  query,
  Timestamp,
} from "firebase/firestore";
import { Topic, Question, UserStats, QuizResult } from "../types";
import { shuffleArray } from "./utils/quizUtils";

// Cache para preguntas generadas
type QuestionCacheEntry = { questions: Question[]; timestamp: number };
const questionCache = new Map<string, QuestionCacheEntry>();
const CACHE_EXPIRATION = 1000 * 60 * 30; // 30 minutos

export const getTopicDetails = async (
  userId: string,
  topicId: string
): Promise<Topic | null> => {
  try {
    const topicDoc = await getDoc(doc(db, "users", userId, "topics", topicId));

    if (!topicDoc.exists()) {
      console.warn(`Topic ${topicId} not found for user ${userId}`);
      return null;
    }

    const topicData = topicDoc.data();

    return {
      id: topicDoc.id,
      name: topicData.name,
      description: topicData.description || "",
      questionCount: topicData.questionCount || 0,
      createdAt: topicData.createdAt?.toDate() || null,
      lastPlayed: topicData.lastPlayed?.toDate() || null,
      lastScore: topicData.lastScore || null,
      correctAnswers: topicData.correctAnswers || [],
      totalAnswers: topicData.totalAnswers || [],
      quizHistory: topicData.quizHistory || [],
      // Añade cualquier otro campo que necesites
    } as Topic;
  } catch (error) {
    console.error(`Error getting topic details for topic ${topicId}:`, error);
    throw new Error("Error al obtener los detalles del tema");
  }
};

/**
 * Obtiene los temas de un usuario
 */
export const getUserTopics = async (userId: string): Promise<Topic[]> => {
  try {
    const topicsSnapshot = await getDocs(
      query(collection(db, "users", userId, "topics"))
    );
    return topicsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      lastPlayed: doc.data().lastPlayed?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Topic[];
  } catch (error) {
    console.error("Error getting user topics:", error);
    throw new Error("Error al obtener los temas del usuario");
  }
};

/**
 * Añade un nuevo tema para un usuario
 */
export const addTopic = async (
  userId: string,
  topicData: Omit<Topic, "id">
): Promise<void> => {
  try {
    await addDoc(collection(db, "users", userId, "topics"), {
      ...topicData,
      createdAt: new Date(),
      questionCount: 0,
      lastPlayed: null,
      correctAnswers: [],
      totalAnswers: [],
    });
  } catch (error) {
    console.error("Error adding topic:", error);
    throw new Error("Error al crear el tema");
  }
};

/**
 * Obtiene las preguntas de un tema específico
 */
export const getTopicQuestions = async (
  userId: string,
  topicId: string
): Promise<Question[]> => {
  try {
    const questionsSnapshot = await getDocs(
      collection(db, "users", userId, "topics", topicId, "questions")
    );
    return questionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Question[];
  } catch (error) {
    console.error("Error getting topic questions:", error);
    throw new Error("Error al obtener las preguntas del tema");
  }
};

/**
 * Obtiene las estadísticas del usuario
 */
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const statsDoc = await getDoc(
      doc(db, "users", userId, "stats", "progress")
    );
    return statsDoc.exists()
      ? (statsDoc.data() as UserStats)
      : {
          progress: 0,
          quizzesTaken: [],
          correctAnswers: 0,
          totalAnswers: 0,
        };
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw new Error("Error al obtener las estadísticas");
  }
};

/**
 * Actualiza las estadísticas del usuario
 */
export const updateUserStats = async (
  userId: string,
  quizResult: QuizResult
): Promise<void> => {
  try {
    const statsRef = doc(db, "users", userId, "stats", "progress");
    const statsDoc = await getDoc(statsRef);

    const progress = calculateProgress(
      quizResult.correctAnswers,
      quizResult.totalQuestions
    );

    const updateData = {
      quizzesTaken: arrayUnion(quizResult),
      progress: progress,
      correctAnswers: quizResult.correctAnswers,
      totalAnswers: quizResult.totalQuestions,
    };

    if (statsDoc.exists()) {
      await updateDoc(statsRef, updateData);
    } else {
      await setDoc(statsRef, {
        ...updateData,
        quizzesTaken: [quizResult],
      });
    }
  } catch (error) {
    console.error("Error updating user stats:", error);
    throw new Error("Error al actualizar las estadísticas");
  }
};

/**
 * Actualiza las estadísticas de un tema
 */
export const updateTopicStats = async (
  userId: string,
  topicId: string,
  quizResult: QuizResult
): Promise<void> => {
  try {
    const topicRef = doc(db, "users", userId, "topics", topicId);

    const updateData = {
      lastPlayed: Timestamp.now(),
      lastScore: quizResult.score,
      quizHistory: arrayUnion(quizResult),
    };

    await updateDoc(topicRef, updateData);
  } catch (error) {
    console.error("Error updating topic stats:", error);
    throw new Error("Error al actualizar las estadísticas del tema");
  }
};

/**
 * Genera preguntas usando DeepSeek API con cache y reintentos
 */
export const generateQuestionsWithDeepSeek = async (
  topic: string,
  count: number = 5,
  difficulty: string = "medium"
): Promise<Question[]> => {
  const cacheKey = `${topic}-${count}-${difficulty}`;
  const now = Date.now();

  // Verificar cache
  const cached = questionCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_EXPIRATION) {
    console.log(`[DeepSeek] Usando preguntas en caché para "${topic}"`);
    return cached.questions;
  }

  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  console.log(
    `[DeepSeek] Iniciando generación de ${count} preguntas sobre "${topic}" con dificultad ${difficulty}`
  );

  while (retryCount <= MAX_RETRIES) {
    try {
      console.log(`[DeepSeek] Intento ${retryCount + 1} para "${topic}"`);

      const startTime = Date.now();
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          count,
          difficulty, // Incluir la dificultad en la solicitud
        }),
      });

      const endTime = Date.now();
      console.log(`[DeepSeek] Respuesta recibida en ${endTime - startTime}ms`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[DeepSeek] Error en API: ${response.status}`, errorData);
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      console.log(
        `[DeepSeek] Preguntas generadas exitosamente para "${topic}"`
      );

      // Validar estructura de las preguntas
      if (!Array.isArray(data)) {
        console.error("[DeepSeek] Formato de respuesta inválido:", data);
        throw new Error("Invalid response format");
      }

      type DeepSeekQuestion = {
        text: string;
        options: string[];
        correctAnswer: string;
        explanation?: string;
        difficulty?: string;
      };

      const questions: Question[] = data.map(
        (q: DeepSeekQuestion, i: number) => ({
          id: `deepseek-${topic}-${i}-${now}`,
          text: q.text,
          options: shuffleArray(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || "",
          topicId: topic,
          difficulty: q.difficulty || difficulty, // Asignar dificultad
        })
      );

      // Actualizar cache
      questionCache.set(cacheKey, {
        questions,
        timestamp: now,
      });

      return questions;
    } catch (error) {
      console.error(`[DeepSeek] Intento ${retryCount + 1} fallido:`, error);
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`[DeepSeek] Reintentando en ${RETRY_DELAY}ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error("[DeepSeek] Todos los intentos fallidos");
        throw new Error("Failed to generate questions after retries");
      }
    }
  }

  throw new Error("Failed to generate questions");
};

/**
 * Obtiene preguntas para el quiz (combina DeepSeek y OpenTriviaDB)
 */
export const getQuizQuestions = async (
  topic: Topic,
  count: number = 10,
  difficulty: string = "mixed"
): Promise<Question[]> => {
  try {
    console.log(
      `Fetching ${count} questions for "${topic.name}" with difficulty ${difficulty}`
    );

    // 1. Primero intentar con DeepSeek
    const deepSeekQuestions = await generateQuestionsWithDeepSeek(
      topic.name,
      count,
      difficulty
    );

    // Filtrar por dificultad si no es "mixed"
    let filteredQuestions = deepSeekQuestions;
    if (difficulty !== "mixed") {
      filteredQuestions = deepSeekQuestions.filter(
        (q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Si obtenemos suficientes preguntas, devolverlas
    if (filteredQuestions.length >= count) {
      return shuffleArray(filteredQuestions.slice(0, count));
    }

    // 2. Completar con OpenTriviaDB si es necesario
    const remaining = count - filteredQuestions.length;
    if (remaining > 0) {
      console.log(
        `Fetching ${remaining} additional questions from OpenTriviaDB`
      );
      const triviaQuestions = await getOpenTriviaQuestions(
        remaining,
        getTriviaCategory(topic.name),
        difficulty !== "mixed" ? difficulty : undefined
      );
      return shuffleArray([...filteredQuestions, ...triviaQuestions]);
    }

    return shuffleArray(filteredQuestions);
  } catch (error) {
    console.error(
      "Error getting questions, falling back to OpenTriviaDB:",
      error
    );
    // Fallback completo a OpenTriviaDB
    return getOpenTriviaQuestions(
      count,
      getTriviaCategory(topic.name),
      difficulty !== "mixed" ? difficulty : undefined
    );
  }
};

/**
 * Obtiene preguntas de OpenTriviaDB
 */
export const getOpenTriviaQuestions = async (
  count: number,
  category: number,
  difficulty?: string
): Promise<Question[]> => {
  try {
    let apiUrl = `https://opentdb.com/api.php?amount=${count}&category=${category}&lang=es&encode=url3986`;

    if (difficulty) {
      apiUrl += `&difficulty=${difficulty}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.response_code !== 0 || !data.results) {
      throw new Error("OpenTriviaDB API error");
    }

    type OpenTriviaQuestion = {
      category: string;
      type: string;
      difficulty: string;
      question: string;
      correct_answer: string;
      incorrect_answers: string[];
    };

    return data.results.map((q: OpenTriviaQuestion, i: number) => {
      const options = [
        ...q.incorrect_answers.map(decodeURIComponent),
        decodeURIComponent(q.correct_answer),
      ];

      return {
        id: `trivia-${category}-${i}-${Date.now()}`,
        text: decodeURIComponent(q.question),
        options: shuffleArray(options),
        correctAnswer: decodeURIComponent(q.correct_answer),
        explanation: `Fuente: OpenTriviaDB (${q.category})`,
        topicId: q.category.toLowerCase(),
        difficulty: q.difficulty,
      };
    });
  } catch (error) {
    console.error("Error getting OpenTriviaDB questions:", error);
    throw new Error("Error al obtener preguntas de trivia");
  }
};

/**
 * Helper para calcular progreso
 */
const calculateProgress = (correct: number, total: number): number => {
  return total > 0 ? Math.min(100, Math.round((correct / total) * 100)) : 0;
};

/**
 * Mapea temas a categorías de OpenTriviaDB
 */
const getTriviaCategory = (topic: string): number => {
  const CATEGORIES: Record<string, number> = {
    historia: 23,
    ciencia: 17,
    geografía: 22,
    arte: 25,
    cultura: 9,
    deportes: 21,
    tecnología: 18,
  };

  return CATEGORIES[topic.toLowerCase()] || 9; // General Knowledge por defecto
};
