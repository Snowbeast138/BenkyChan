// Importa el icono FiCheck (Check de Feather Icons) de react-icons
import { FiCheck } from "react-icons/fi";
// Importa el tipo Topic desde los tipos definidos en la aplicación
import { Topic } from "@/types";

// Define la interfaz para las props del componente TopicCard
interface TopicCardProps {
  topic: Topic; // Objeto que contiene la información del tema
  isSelected: boolean; // Indica si el tema está seleccionado
  onToggleSelect: (id: string) => void; // Función para manejar la selección/deselección
}

/**
 * Componente TopicCard
 * 
 * Representa una tarjeta interactiva para mostrar información de un tema.
 * Permite seleccionar/deseleccionar el tema al hacer click y muestra:
 * - Nombre del tema
 * - Cantidad de preguntas
 * - Fecha del último juego (si existe)
 * - Estado de selección (con icono de check)
 * 
 * @param {TopicCardProps} props - Props del componente
 * @param {Topic} props.topic - Datos del tema a mostrar
 * @param {boolean} props.isSelected - Estado de selección del tema
 * @param {function} props.onToggleSelect - Función para alternar selección
 * @returns {JSX.Element} - Tarjeta visual de un tema con interacción
 */
export const TopicCard = ({
  topic,
  isSelected,
  onToggleSelect,
}: TopicCardProps) => {
  return (
    // Contenedor principal de la tarjeta con manejo de clicks y estilos condicionales
    <div
      onClick={() => onToggleSelect(topic.id)} // Maneja el evento de click
      className={`p-5 border rounded-xl cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-blue-100 shadow-sm" // Estilos cuando está seleccionado
          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50" // Estilos cuando no está seleccionado
      }`}
    >
      {/* Encabezado de la tarjeta con nombre del tema e icono de selección */}
      <div className="flex justify-between items-start mb-2">
        {/* Nombre del tema */}
        <h3 className="font-semibold text-gray-800">{topic.name}</h3>
        {/* Muestra el icono de check solo si el tema está seleccionado */}
        {isSelected ? (
          <span className="bg-blue-500 text-white p-1 rounded-full">
            <FiCheck className="text-sm" />
          </span>
        ) : null}
      </div>

      {/* Badge que muestra la cantidad de preguntas con pluralización correcta */}
      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md mb-2">
        {topic.questionCount}{" "}
        {topic.questionCount === 1 ? "pregunta" : "preguntas"}
      </span>

      {/* Muestra la fecha del último juego si existe */}
      {topic.lastPlayed && (
        <p className="text-xs text-gray-500 mt-2">
          Jugado:{" "}
          {new Date(
            topic.lastPlayed instanceof Date
              ? topic.lastPlayed
              : topic.lastPlayed.toDate() // Convierte Timestamp de Firebase a Date si es necesario
          ).toLocaleDateString()} {/* Formatea la fecha según el locale */}
        </p>
      )}
    </div>
  );
};