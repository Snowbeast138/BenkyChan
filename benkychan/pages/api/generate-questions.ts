import { NextApiRequest, NextApiResponse } from "next";

interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: string;
}

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const TIMEOUT = 30000;

interface DeepSeekAPIResponse {
  choices: {
    message?: {
      content?: string;
    };
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  console.log("[API] Solicitud recibida para generar preguntas");

  if (req.method !== "POST") {
    console.warn("[API] Método no permitido");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { topic, count, difficulty = "mixed" } = req.body;
    console.log("Request body:", req.body);
    console.log(
      `[API] Parámetros recibidos - Tema: ${topic}, Cantidad: ${count}, Dificultad: ${difficulty}`
    );

    // Validaciones
    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      console.warn("[API] Tema inválido recibido");
      res.status(400).json({
        error: "Topic is required and must be a non-empty string",
        details: { received: topic },
      });
      return;
    }

    if (!count || typeof count !== "number" || count < 1 || count > 20) {
      console.warn("[API] Cantidad inválida recibida");
      res.status(400).json({
        error: "Count must be a number between 1 and 20",
        details: { received: count },
      });
      return;
    }

    const validDifficulties = ["easy", "medium", "hard", "mixed"];
    if (!validDifficulties.includes(difficulty)) {
      console.warn("[API] Dificultad inválida recibida");
      res.status(400).json({
        error: "Difficulty must be one of: easy, medium, hard, mixed",
        details: { received: difficulty },
      });
      return;
    }

    const callDeepSeekAPI = async (
      retryCount = 0
    ): Promise<DeepSeekAPIResponse> => {
      try {
        console.log(
          `[API] Llamando a DeepSeek API (Intento ${retryCount + 1})`
        );

        const difficultyInstruction =
          difficulty !== "mixed"
            ? `Las preguntas deben ser de dificultad ${difficulty}. `
            : "";

        const prompt = `Genera exactamente ${count} preguntas tipo trivia sobre "${topic}". ${difficultyInstruction}Cada pregunta debe tener:
        - Texto claro y conciso
        - 4 opciones (1 correcta y 3 incorrectas)
        - Explicación breve de la respuesta correcta
        - Dificultad (easy, medium o hard)
        - Formato JSON válido como:
        {
          "questions": [
            {
              "text": "pregunta",
              "options": ["op1", "op2", "op3", "op4"],
              "correctAnswer": "op1",
              "explanation": "explicación breve",
              "difficulty": "nivel de dificultad"
            }
          ]
        }
        Asegúrate que:
        1. Todas las preguntas sean sobre ${topic}
        2. El JSON sea válido y esté bien formado
        3. No incluyas texto adicional fuera del JSON`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT);

        const response = await fetch(DEEPSEEK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            temperature: difficulty === "hard" ? 0.8 : 0.7,
            max_tokens: 3000,
            response_format: { type: "json_object" },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          console.log(`[API] Reintentando en ${RETRY_DELAY}ms...`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return callDeepSeekAPI(retryCount + 1);
        }
        throw error;
      }
    };

    const data = await callDeepSeekAPI();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response content from DeepSeek API");
    }

    // Limpieza y parseo del contenido
    const jsonString = content.trim();
    const jsonStart = Math.max(
      jsonString.indexOf('{"questions":'),
      jsonString.indexOf('{"questions" :'),
      jsonString.indexOf('{ "questions":')
    );

    const parsedData =
      jsonStart !== -1
        ? JSON.parse(jsonString.slice(jsonStart))
        : JSON.parse(jsonString);

    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      throw new Error("Invalid response structure - missing questions array");
    }

    const questions: Question[] = parsedData.questions.map(
      (q: unknown, i: number) => {
        if (
          typeof q !== "object" ||
          q === null ||
          !("text" in q) ||
          !("options" in q) ||
          !("correctAnswer" in q)
        ) {
          throw new Error(`Invalid question structure at index ${i}`);
        }

        const questionObj = q as {
          text: string;
          options: string[];
          correctAnswer: string;
          explanation?: string;
          difficulty?: string;
        };

        if (!questionObj.options.includes(questionObj.correctAnswer)) {
          throw new Error(`Correct answer not in options at index ${i}`);
        }

        return {
          text: questionObj.text,
          options: questionObj.options,
          correctAnswer: questionObj.correctAnswer,
          explanation: questionObj.explanation || "",
          difficulty: questionObj.difficulty || difficulty,
        };
      }
    );

    // Filtrar por dificultad si no es "mixed"
    const filteredQuestions =
      difficulty !== "mixed"
        ? questions.filter((q) => q.difficulty === difficulty)
        : questions;

    if (filteredQuestions.length === 0) {
      throw new Error("No valid questions generated after filtering");
    }

    res.status(200).json(filteredQuestions.slice(0, count));
  } catch (error) {
    console.error("[API] Error en el handler:", error);
    const statusCode =
      error instanceof Error && error.message.includes("Invalid") ? 422 : 500;
    res.status(statusCode).json({
      error: "Error generating questions",
      details:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? { message: error.message, stack: error.stack }
          : undefined,
    });
  }
}
