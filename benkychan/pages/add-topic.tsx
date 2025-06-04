import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { addTopic } from "../lib/api";
import { useAuthRedirect } from "../lib/hooks/useAuthRedirect";
import { Header } from "../src/components/layout/Header";
import { Footer } from "../src/components/layout/Footer";

export default function AddTopic() {
  useAuthRedirect();
  const router = useRouter();
  const [topicName, setTopicName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return;

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await addTopic(user.uid, {
          name: topicName,
          description,
          questionCount: 0,
          createdAt: new Date(),
        });
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
      <Header />

      <main className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Añadir Nuevo Tema
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
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

      <Footer />
    </div>
  );
}
