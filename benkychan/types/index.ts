import { Timestamp } from "firebase/firestore";

/**
 * Representa el resultado de un quiz completado por un usuario
 * @property {string} quizId - ID único del quiz
 * @property {Date | Timestamp} date - Fecha de realización del quiz
 * @property {number} correctAnswers - Número de respuestas correctas
 * @property {number} totalQuestions - Total de preguntas en el quiz
 * @property {number} score - Puntuación calculada (correctAnswers/totalQuestions)
 * @property {string[]} topics - Lista de temas cubiertos en el quiz
 */
export interface QuizResult {
  quizId: string;
  date: Date | Timestamp;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  topics: string[];
}

/**
 * Representa un tema/categoría de preguntas en el sistema
 * @property {string} id - ID único del tema
 * @property {string} name - Nombre del tema
 * @property {string} [description] - Descripción opcional del tema
 * @property {number} questionCount - Número total de preguntas en este tema
 * @property {boolean[]} [correctAnswers] - Historial de respuestas correctas
 * @property {boolean[]} [totalAnswers] - Historial de todas las respuestas
 * @property {Date | Timestamp} [lastPlayed] - Fecha de última interacción
 * @property {number} [lastScore] - Puntuación del último intento
 * @property {QuizResult[]} [quizHistory] - Historial de quizzes sobre este tema
 * @property {Date | Timestamp} createdAt - Fecha de creación del tema
 * @property {string} [category] - Categoría principal a la que pertenece
 */
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

/**
 * Representa una pregunta individual del sistema
 * @property {string} id - ID único de la pregunta
 * @property {string} text - Enunciado de la pregunta
 * @property {string[]} options - Opciones de respuesta disponibles
 * @property {string} correctAnswer - Respuesta correcta
 * @property {string} [explanation] - Explicación opcional de la respuesta
 * @property {string} [topicId] - ID del tema al que pertenece
 * @property {string} [difficulty] - Nivel de dificultad ('easy', 'medium', 'hard')
 */
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  topicId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Estadísticas de usuario en el sistema
 * @property {number} progress - Progreso general del usuario (0-100)
 * @property {QuizResult[]} quizzesTaken - Historial de quizzes completados
 * @property {number} correctAnswers - Total de respuestas correctas
 * @property {number} totalAnswers - Total de respuestas dadas
 */
export interface UserStats {
  progress: number;
  quizzesTaken: QuizResult[];
  correctAnswers: number;
  totalAnswers: number;
}

/**
 * Representa una relación entre temas
 * @property {string} id - ID del tema relacionado
 * @property {string} name - Nombre del tema relacionado
 * @property {"fundamental" | "indirect"} relationType - Tipo de relación
 * @property {number} weight - Peso/importancia de la relación (1-10)
 */
export interface RelatedTopic {
  id: string;
  name: string;
  relationType: 'fundamental' | 'indirect';
  weight: number;
}

/**
 * Grafo de conocimiento que representa las relaciones entre temas
 * @property {Array} nodes - Nodos del grafo (temas)
 *   @property {string} id - ID del nodo/tema
 *   @property {string} name - Nombre del nodo/tema
 *   @property {"easy" | "medium" | "hard"} difficulty - Dificultad del tema
 * @property {Array} links - Relaciones entre temas (antes llamado 'edges')
 *   @property {string} source - ID del nodo origen
 *   @property {string} target - ID del nodo destino
 *   @property {number} weight - Peso de la relación
 *   @property {"fundamental" | "indirect"} type - Tipo de relación
 */
export interface KnowledgeGraph {
  nodes: {
    id: string;
    name: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  links: {
    source: string;
    target: string;
    weight: number;
    type: 'fundamental' | 'indirect';
  }[];
}