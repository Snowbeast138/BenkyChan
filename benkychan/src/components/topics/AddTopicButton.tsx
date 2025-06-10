import Link from "next/link";
import { FiPlus } from "react-icons/fi";

export const AddTopicButton = () => {
  return (
    <Link href="/add-topic">
      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        <FiPlus />
        Añadir Tema
      </button>
    </Link>
  );
};
import Link from "next/link";
import { FiPlus } from "react-icons/fi";

/**
 * AddTopicButton Component
 * 
 * Un botón reutilizable que redirige a la página de añadir nuevo tema.
 * 
 * Características:
 * - Utiliza el componente Link de Next.js para navegación del lado del cliente
 * - Incluye un icono de plus (FiPlus) de react-icons
 * - Estilos con clases de Tailwind CSS para apariencia consistente
 * - Efecto hover para mejor feedback visual
 * 
 * @returns {JSX.Element} Un botón clickeable que navega a /add-topic
 */
export const AddTopicButton = () => {
  return (
    <Link href="/add-topic" passHref legacyBehavior>
      {/* Contenedor del botón con estilos Tailwind */}
      <button 
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        aria-label="Añadir nuevo tema"  // Mejora accesibilidad
      >
        {/* Icono de plus */}
        <FiPlus className="text-lg" />
        
        {/* Texto del botón */}
        <span>Añadir Tema</span>
      </button>
    </Link>
  );
};