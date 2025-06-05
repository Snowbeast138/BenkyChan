import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Validación del método HTTP
  if (req.method !== "POST") {
    console.error(`Método no permitido: ${req.method}`);
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Validación del cuerpo de la solicitud
  const { topic, count = 5 } = req.body;

  if (!topic) {
    console.error('Falta el parámetro "topic" en el cuerpo de la solicitud');
    return res.status(400).json({ error: "Topic is required" });
  }

  console.log(
    `[DeepSeek] Iniciando solicitud para tema: "${topic}", cantidad: ${count}`
  );

  try {
    // 3. Configuración de la solicitud a DeepSeek
    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `Lista ${count} temas relacionados con "${topic}". Devuelve SOLO un objeto JSON válido con la estructura: {"relatedTopics": ["tema1", "tema2"]}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    };

    console.log("[DeepSeek] Enviando solicitud a la API:", {
      endpoint: "https://api.deepseek.com/v1/chat/completions",
      body: requestBody,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          process.env.DEEPSEEK_API_KEY ? "***REDACTED***" : "MISSING"
        }`,
      },
    });

    // 4. Realizar la solicitud a la API de DeepSeek
    const startTime = Date.now();
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );
    const responseTime = Date.now() - startTime;

    console.log(`[DeepSeek] Respuesta recibida en ${responseTime}ms`, {
      status: response.status,
      statusText: response.statusText,
    });

    // 5. Manejo de errores de la respuesta HTTP
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error("[DeepSeek] Error en la respuesta de la API:", errorData);
      } catch (e) {
        console.error("[DeepSeek] Error al parsear respuesta de error:", e);
        errorData = { error: "Failed to parse error response" };
      }

      return res.status(response.status).json({
        error: "DeepSeek API request failed",
        status: response.status,
        details: errorData,
      });
    }

    // 6. Procesamiento de la respuesta exitosa
    let data;
    try {
      data = await response.json();
      console.log("[DeepSeek] Respuesta completa de la API:", data);
    } catch (e) {
      console.error("[DeepSeek] Error al parsear respuesta JSON:", e);
      return res.status(500).json({
        error: "Failed to parse API response",
        details: { error: e instanceof Error ? e.message : "Unknown error" },
      });
    }

    // 7. Extracción y validación del contenido
    let content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error(
        "[DeepSeek] No se encontró contenido en la respuesta:",
        data
      );
      return res.status(500).json({
        error: "No content found in API response",
        response: data,
      });
    }

    console.log("[DeepSeek] Contenido crudo recibido:", content);

    // 8. Limpieza del contenido (remover markdown si existe)
    if (content.includes("```json")) {
      console.log("[DeepSeek] Detectado formato markdown, limpiando...");
      content = content.replace(/```json\n?|\n```/g, "");
    }

    // 9. Parseo y validación del JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
      console.log("[DeepSeek] JSON parseado correctamente:", parsedContent);
    } catch (parseError) {
      console.error("[DeepSeek] Error al parsear JSON:", {
        error: parseError,
        content: content,
      });
      return res.status(500).json({
        error: "Failed to parse content as JSON",
        content: content,
        details:
          parseError instanceof Error
            ? parseError.message
            : "Unknown parse error",
      });
    }

    // 10. Extracción del array de temas
    let topicsArray;
    if (Array.isArray(parsedContent)) {
      console.log("[DeepSeek] Respuesta es un array directo");
      topicsArray = parsedContent;
    } else if (
      parsedContent.relatedTopics &&
      Array.isArray(parsedContent.relatedTopics)
    ) {
      console.log("[DeepSeek] Respuesta contiene propiedad relatedTopics");
      topicsArray = parsedContent.relatedTopics;
    } else {
      console.error(
        "[DeepSeek] Formato de respuesta no reconocido:",
        parsedContent
      );
      return res.status(500).json({
        error: "Invalid response format",
        expected: "Array or { relatedTopics: Array }",
        received: parsedContent,
      });
    }

    // 11. Validación final del array de temas
    if (!Array.isArray(topicsArray)) {
      console.error("[DeepSeek] topicsArray no es un array:", topicsArray);
      return res.status(500).json({
        error: "Response is not a valid array",
        content: topicsArray,
      });
    }

    // 12. Procesamiento de los resultados
    const result = topicsArray.map((name: string) => {
      const relevanceScore = calculateRelevanceScore(name, topic);
      console.log(
        `[DeepSeek] Procesando tema: "${name}" -> Relevancia: ${relevanceScore}`
      );
      return { name, relevanceScore };
    });

    // 13. Log detallado de los resultados
    console.log("[DeepSeek] Resultados finales:", {
      topicPrincipal: topic,
      temasRelacionados: result.map(
        (t, i) => `${i + 1}. ${t.name} (${t.relevanceScore})`
      ),
      totalTemas: result.length,
    });

    // 14. Retornar respuesta exitosa
    return res.status(200).json({
      relatedTopics: result,
      debug: {
        request: { topic, count },
        responseTime: `${responseTime}ms`,
        apiResponse: data,
      },
    });
  } catch (error) {
    console.error("[DeepSeek] Error en el proceso principal:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

// Función auxiliar para calcular puntuación de relevancia
function calculateRelevanceScore(topicName: string, mainTopic: string): number {
  try {
    const similarity = topicName.toLowerCase().includes(mainTopic.toLowerCase())
      ? 8 // Mayor puntuación si incluye el nombre del tema principal
      : 5; // Puntuación base si no lo incluye

    // Asegurar que el score esté entre 1 y 10
    return Math.min(10, Math.max(1, similarity));
  } catch (error) {
    console.error("[calculateRelevanceScore] Error calculando score:", {
      topicName,
      mainTopic,
      error,
    });
    return 5; // Valor por defecto en caso de error
  }
}
