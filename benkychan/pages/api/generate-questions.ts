import { NextApiRequest, NextApiResponse } from "next";

interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const TIMEOUT = 30000; // 30 segundos

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
) {
  console.log("[API] Solicitud recibida para generar preguntas");

  if (req.method !== "POST") {
    console.warn("[API] Método no permitido");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic, count } = req.body;
  console.log("Request body:", req.body);
  console.log(
    `[API] Parámetros recibidos - Tema: ${topic}, Cantidad: ${count}`
  );

  // Validaciones mejoradas
  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    console.warn("[API] Tema inválido recibido");
    return res.status(400).json({
      error: "Topic is required and must be a non-empty string",
      details: { received: topic },
    });
  }

  if (!count || typeof count !== "number" || count < 1 || count > 20) {
    console.warn("[API] Cantidad inválida recibida");
    return res.status(400).json({
      error: "Count must be a number between 1 and 20",
      details: { received: count },
    });
  }

  const callDeepSeekAPI = async (
    retryCount = 0
  ): Promise<DeepSeekAPIResponse> => {
    try {
      console.log(`[API] Llamando a DeepSeek API (Intento ${retryCount + 1})`);

      const prompt = `Genera exactamente ${count} preguntas tipo trivia sobre "${topic}". Cada pregunta debe tener:
      - Texto claro y conciso
      - 4 opciones (1 correcta y 3 incorrectas)
      - Explicación breve de la respuesta correcta
      - Formato JSON válido como:
      {
        "questions": [
          {
            "text": "pregunta",
            "options": ["op1", "op2", "op3", "op4"],
            "correctAnswer": "op1",
            "explanation": "explicación breve"
          }
        ]
      }
      Asegúrate que:
      1. Todas las preguntas sean sobre ${topic}
      2. El JSON sea válido y esté bien formado
      3. No incluyas texto adicional fuera del JSON`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT);

      const startTime = Date.now();
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 3000,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const endTime = Date.now();

      const data = await response.json();
      console.log(`[API] DeepSeek respondió en ${endTime - startTime}ms`, {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        console.error(`[API] Error de DeepSeek: ${response.status}`, data);
        throw new Error(`API error: ${response.status}`);
      }

      console.log("[API] Preguntas generadas exitosamente");
      return data;
    } catch (error) {
      console.error(`[API] Intento ${retryCount + 1} fallido:`, error);
      if (retryCount < MAX_RETRIES) {
        console.log(`[API] Reintentando en ${RETRY_DELAY}ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return callDeepSeekAPI(retryCount + 1);
      }
      console.error("[API] Todos los intentos fallidos");
      throw error;
    }
  };

  try {
    console.log("[API] Procesando solicitud...");
    const data = await callDeepSeekAPI();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.warn("[API] Respuesta sin contenido");
      throw new Error("No response content from DeepSeek API");
    }

    // Limpieza mejorada del contenido
    let jsonString = content.trim();
    const jsonStart = Math.max(
      jsonString.indexOf('{"questions":'),
      jsonString.indexOf('{"questions" :'),
      jsonString.indexOf('{ "questions":')
    );

    if (jsonStart !== -1) {
      jsonString = jsonString.slice(jsonStart);
    }

    console.log("[API] Parseando respuesta JSON");
    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("[API] Error parseando JSON:", {
        error: parseError,
        content: jsonString,
      });
      throw new Error("Invalid JSON format from DeepSeek API");
    }

    // Validación de estructura
    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      console.error("[API] Estructura de respuesta inválida", parsedData);
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
          console.error(
            `[API] Estructura de pregunta inválida en índice ${i}:`,
            q
          );
          throw new Error(`Invalid question structure at index ${i}`);
        }

        const questionObj = q as Question;

        // Validar que la respuesta correcta esté en las opciones
        if (!questionObj.options.includes(questionObj.correctAnswer)) {
          console.error(
            `[API] Respuesta correcta no encontrada en opciones (índice ${i})`,
            {
              options: questionObj.options,
              correctAnswer: questionObj.correctAnswer,
            }
          );
          throw new Error(`Correct answer not in options at index ${i}`);
        }

        return {
          text: questionObj.text,
          options: questionObj.options,
          correctAnswer: questionObj.correctAnswer,
          explanation: questionObj.explanation || "",
        };
      }
    );

    // Validar cantidad de preguntas
    if (questions.length !== count) {
      console.warn(
        `[API] Se solicitaron ${count} preguntas pero se recibieron ${questions.length}`
      );
      if (questions.length === 0) {
        throw new Error("No valid questions generated");
      }
    }

    console.log(`[API] Devolviendo ${questions.length} preguntas válidas`);
    return res.status(200).json(questions.slice(0, count));
  } catch (error) {
    console.error("[API] Error en el handler:", error);

    const statusCode =
      error instanceof Error && error.message.includes("Invalid") ? 422 : 500;
    const errorResponse = {
      error: "Error generating questions",
      details:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              topic,
              count,
            }
          : undefined,
    };

    return res.status(statusCode).json(errorResponse);
  }
}
