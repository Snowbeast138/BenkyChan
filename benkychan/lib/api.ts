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
import {
  Topic,
  Question,
  UserStats,
  QuizResult,
  RelatedTopic,
  KnowledgeGraph,
} from "../types";
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

/**
 * Obtiene temas relacionados desde DeepSeek API
 */
export const getRelatedTopics = async (
  topicName: string,
  count: number = 5
): Promise<RelatedTopic[]> => {
  try {
    const response = await fetch("/api/get-related-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: topicName,
        count,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", {
        status: response.status,
        errorData,
      });
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Validación de la respuesta
    if (!data.relatedTopics || !Array.isArray(data.relatedTopics)) {
      console.warn("Unexpected API response format:", data);
      return getFallbackTopics(topicName);
    }

    return data.relatedTopics.map(
      (t: { name: string; relevanceScore: number }, i: number) => ({
        id: `generated-${t.name.toLowerCase().replace(/\s+/g, "-")}-${i}`,
        name: t.name,
        relationType: t.relevanceScore >= 7 ? "fundamental" : "indirect",
        weight: Math.min(10, Math.max(1, t.relevanceScore)),
      })
    );
  } catch (error) {
    console.error("Error getting related topics:", error);
    return getFallbackTopics(topicName);
  }
};

function getFallbackTopics(mainTopic: string): RelatedTopic[] {
  return [
    {
      id: `fallback-1`,
      name: `Conceptos básicos de ${mainTopic}`,
      relationType: "fundamental",
      weight: 8,
    },
    {
      id: `fallback-2`,
      name: `Aplicaciones de ${mainTopic}`,
      relationType: "indirect",
      weight: 6,
    },
  ];
}

/**
 * Construye el grafo de conocimiento
 */
export const buildKnowledgeGraph = async (
  userId: string,
  mainTopicIds: string[]
): Promise<KnowledgeGraph> => {
  const graph: KnowledgeGraph = { nodes: [], links: [] };

  // 1. Obtener los temas principales
  const mainTopics = await Promise.all(
    mainTopicIds.map((id) => getTopicDetails(userId, id))
  );

  // Añadir nodos principales
  mainTopics.forEach((topic) => {
    if (!topic) return;

    graph.nodes.push({
      id: topic.id,
      name: topic.name,
      difficulty: "medium",
    });
  });

  // 2. Obtener temas relacionados para cada tema principal
  for (const topic of mainTopics) {
    if (!topic) continue;

    try {
      const relatedTopics = await getRelatedTopics(topic.name, 5);

      // Procesar temas relacionados
      relatedTopics.forEach((related) => {
        // Verificar si el nodo ya existe
        const existingNode = graph.nodes.find((n) => n.id === related.id);

        if (!existingNode) {
          graph.nodes.push({
            id: related.id,
            name: related.name,
            difficulty:
              related.relationType === "fundamental" ? "easy" : "hard",
          });
        }

        // Añadir conexión
        graph.links.push({
          source: topic.id,
          target: related.id,
          weight: related.weight,
          type: related.relationType,
        });
      });
    } catch (error) {
      console.error(`Error getting related topics for ${topic.name}:`, error);
      // Continuar con el siguiente tema si hay error
    }
  }

  return graph;
};
/**
 * Implementación de Dijkstra para encontrar el mejor camino de aprendizaje
 */
export const findOptimalLearningPath = (
  graph: KnowledgeGraph,
  startTopicId: string
): string[] => {
  // Verificar si el nodo de inicio existe en el grafo
  if (!graph.nodes.some((node) => node.id === startTopicId)) {
    console.warn(`Start topic ID ${startTopicId} not found in graph`);
    return [];
  }

  const nodes = graph.nodes.map((n) => n.id);
  const links = graph.links; // Cambiado de edges a links

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();

  // Inicialización
  nodes.forEach((node) => {
    distances[node] = node === startTopicId ? 0 : Infinity;
    previous[node] = null;
  });

  // Procesamiento con algoritmo Dijkstra
  while (visited.size < nodes.length) {
    // Encontrar el nodo no visitado con la distancia más pequeña
    const unvisitedNodes = Object.entries(distances)
      .filter(([node]) => !visited.has(node))
      .sort((a, b) => a[1] - b[1]);

    // Si no hay nodos alcanzables no visitados, terminar
    if (unvisitedNodes.length === 0 || unvisitedNodes[0][1] === Infinity) break;

    const [currentNode] = unvisitedNodes[0];

    visited.add(currentNode);

    // Obtener todos los enlaces salientes del nodo actual
    const outgoingLinks = links.filter((link) => link.source === currentNode);

    // Actualizar distancias para los nodos vecinos
    for (const link of outgoingLinks) {
      const neighbor = link.target;
      const weight = 11 - link.weight; // Invertimos el peso (mayor peso = mejor conexión)

      const totalDistance = distances[currentNode] + weight;

      if (totalDistance < distances[neighbor]) {
        distances[neighbor] = totalDistance;
        previous[neighbor] = currentNode;
      }
    }
  }

  // Reconstruir el camino óptimo
  const path: string[] = [];

  // Ordenar nodos por distancia (excluyendo el nodo de inicio)
  const sortedNodes = Object.entries(distances)
    .filter(([node]) => node !== startTopicId)
    .sort((a, b) => a[1] - b[1])
    .map(([node]) => node);

  // Construir camino desde el nodo más cercano
  let current: string | null = sortedNodes[0] || null;

  while (current && current !== startTopicId) {
    path.unshift(current); // Añadir al principio del array
    current = previous[current];
  }

  // Añadir el nodo de inicio al principio si hay un camino
  if (path.length > 0) {
    path.unshift(startTopicId);
  }

  return path;
};
