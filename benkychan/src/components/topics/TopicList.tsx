// Importa el tipo Topic desde los tipos definidos en la aplicación
import { Topic } from "@/types";
// Importa el componente TopicCard para mostrar cada tema individual
import { TopicCard } from "./TopicCard";
// Importa el icono FiPlus (Plus de Feather Icons) de react-icons
import { FiPlus } from "react-icons/fi";
// Importa el componente Link de Next.js para navegación client-side
import Link from "next/link";

// Define la interfaz para las props del componente TopicList
interface TopicListProps {
  topics: Topic[]; // Array de temas a mostrar
  loading: boolean; // Indica si los datos están cargando
  selectedTopics: string[]; // Array con los IDs de los temas seleccionados
  onTopicSelect: (id: string) => void; // Función para manejar la selección de temas
}

/**
 * Componente TopicList
 * 
 * Muestra una lista interactiva de temas con manejo de estados:
 * - Estado de carga (loading)
 * - Lista vacía (sin temas)
 * - Lista con temas disponibles
 * 
 * Responsive: se adapta a diferentes tamaños de pantalla (1, 2 o 3 columnas)
 * 
 * @param {TopicListProps} props - Props del componente
 * @param {Topic[]} props.topics - Array de temas a mostrar
 * @param {boolean} props.loading - Estado de carga
 * @param {string[]} props.selectedTopics - IDs de temas seleccionados
 * @param {function} props.onTopicSelect - Función para manejar selección
 * @returns {JSX.Element} - Lista de temas o estados alternativos (carga/vacío)
 */
export const TopicList = ({
  topics,
  loading,
  selectedTopics,
  onTopicSelect,
}: TopicListProps) => {
  // Estado de carga: muestra un spinner animado
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Estado sin temas: muestra mensaje y botón para crear primer tema
  if (topics.length === 0) {
    return (
      <div className="text-center py-12">
        {/* Icono visual indicador para añadir temas */}
        <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <FiPlus className="text-blue-600 text-3xl" />
        </div>
        {/* Mensaje indicando que no hay temas */}
        <p className="text-gray-500 mb-6 text-lg">No tienes temas aún</p>
        {/* Botón para redirigir a la creación de temas */}
        <Link href="/add-topic">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Añade tu primer tema
          </button>
        </Link>
      </div>
    );
  }

  // Estado normal: muestra la lista de temas en grid responsive
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Mapea cada tema a un componente TopicCard */}
      {topics.map((topic) => (
        <TopicCard
          key={topic.id} // Key única para optimización de React
          topic={topic} // Datos del tema
          isSelected={selectedTopics.includes(topic.id)} // Verifica si está seleccionado
          onToggleSelect={onTopicSelect} // Función para manejar selección
        />
      ))}
    </div>
  );
};