import { Timestamp } from "firebase/firestore"; // Importa el tipo Timestamp de Firestore para manejar fechas

export interface QuizResult { //Interfaz que representa el resultado de un quiz
  quizId: string; //ID único del quiz
  date: Date | Timestamp; //Fecha cuando se realizó el quiz
  correctAnswers: number; //Número de respuestas correctas
  totalQuestions: number; //Total de preguntas en el quiz
  score: number; //Puntaje obtenido (correctAnswers/totalQuestions)
  topics: string[]; //IDs de los temas relacionados al quiz
}

export interface Topic { //Interfaz que representa un tema 
  id: string; //ID único del tema
  name: string; //Nombre del tema
  description?: string; //Descripción opcional del tema
  questionCount: number; //Número total de preguntas en el tema
  correctAnswers?: boolean[]; //Array histórico de respuestas correctas
  totalAnswers?: boolean[]; //Array histórico de respuestas totales
  lastPlayed?: Date | Timestamp; //Fecha de última interacción
  lastScore?: number; //Último puntaje obtenido
  quizHistory?: QuizResult[]; //Historial de resultados de quizzes
  createdAt: Date | Timestamp; //Fecha de creación del tema
  category?: string; //Categoría opcional del tema
}

export interface Question { //Interfaz que representa una pregunta
  id: string; //ID único de la pregunta
  text: string; //Enunciado de la pregunta
  options: string[]; //Opciones de respuesta
  correctAnswer: string; //Opción correcta
  explanation?: string; //Explicación opcional de la respuesta
  topicId?: string; //ID del tema relacionado
  difficulty?: string; // 'easy', 'medium', 'hard' Nivel de dificultad
}

export interface UserStats { //Interfaz que representa las estadísticas del usuario
  progress: number; //Progreso general del usuario 
  quizzesTaken: QuizResult[]; //Historial de quizzes completados
  correctAnswers: number; //Total de respuestas correctas
  totalAnswers: number; //Total de respuestas intentadas
}

export interface RelatedTopic { //Interfaz que representa un tema relacionado
  id: string; //ID del tema relacionado
  name: string; //Nombre del tema relacionado
  relationType: "fundamental" | "indirect"; //Tipo de relación
  weight: number; // Peso de la relación (1-10)
}

export interface KnowledgeGraph { //Interfaz que representa un grafo de la ruta de aprendizaje
  nodes: { //Nodos del grafo
    id: string; //ID del nodo
    name: string; //Nombre del nodo
    difficulty: "easy" | "medium" | "hard"; //Dificultad del nodo
  }[];
  links: {
    // Cambiado de 'edges' a 'links'
    source: string; //ID del nodo origen
    target: string; //ID del nodo destino
    weight: number; //Peso de la conexión
    type: "fundamental" | "indirect"; //Tipo de conexión
  }[];
}
