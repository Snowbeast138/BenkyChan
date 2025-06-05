import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { addTopic } from "../lib/api";
import { useAuthRedirect } from "../lib/hooks/useAuthRedirect";
import { Header } from "../src/components/layout/Header";
import { Footer } from "../src/components/layout/Footer";

/**
 * Componente para añadir nuevos temas.
 * Permite a los usuarios autenticados crear nuevos temas con nombre y descripción.
 * Redirige a usuarios no autenticados a la página de login.
 */
export default function AddTopic() {
  // Redirige a los usuarios no autenticados a la página de login
  useAuthRedirect();
  
  // Hook de Next.js para manejar el enrutamiento
  const router = useRouter();
  
  // Estado para el nombre del tema
  const [topicName, setTopicName] = useState("");
  // Estado para la descripción del tema
  const [description, setDescription] = useState("");
  // Estado para manejar el estado de envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja el envío del formulario para crear un nuevo tema.
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validación básica - el nombre no puede estar vacío
    if (!topicName.trim()) return;

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Llama a la API para añadir el tema
        await addTopic(user.uid, {
          name: topicName,
          description,
          questionCount: 0, // Inicializa con 0 preguntas
          createdAt: new Date(), // Fecha actual de creación
        });
        // Redirige a la página principal después de crear el tema
        router.push("/");
      }
    } catch (error) {
      console.error("Error adding topic:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      {/* Componente de cabecera */}
      <Header />

      {/* Contenido principal */}
      <main className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* Título del formulario */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Añadir Nuevo Tema
        </h2>

        {/* Formulario para añadir tema */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo para el nombre del tema */}
          <div>
            <label
              htmlFor="topicName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Tema *
            </label>
            <input
              id="topicName"
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>

          {/* Campo para la descripción del tema */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripción (Opcional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            {/* Botón para cancelar y volver a la página principal */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            
            {/* Botón para enviar el formulario */}
            <button
              type="submit"
              disabled={isSubmitting || !topicName.trim()}
              className={`px-4 py-2 rounded-lg text-white ${
                isSubmitting || !topicName.trim()
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Guardando..." : "Guardar Tema"}
            </button>
          </div>
        </form>
      </main>

      {/* Componente de pie de página */}
      <Footer />
    </div>
  );
}