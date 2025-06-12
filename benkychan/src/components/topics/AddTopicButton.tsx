// Importa el componente Link de Next.js para habilitar la navegación entre páginas
import Link from "next/link";
// Importa el icono FiPlus (Plus de Feather Icons) de react-icons
import { FiPlus } from "react-icons/fi";

/**
 * Componente AddTopicButton
 * 
 * Este componente renderiza un botón que redirige a la página de añadir temas.
 * Utiliza el componente Link de Next.js para una navegación client-side eficiente.
 * El botón tiene estilos consistentes con un diseño moderno y feedback visual al hacer hover.
 * 
 * Props: No recibe propiedades
 * 
 * @returns {JSX.Element} - Retorna un botón estilizado con un icono de más y el texto "Añadir Tema"
 */
export const AddTopicButton = () => {
  return (
    // Componente Link que envuelve el botón y define la ruta de destino (/add-topic)
    <Link href="/add-topic">
      {/* Botón con estilos Tailwind CSS que incluye:
          - Diseño flex para alinear icono y texto
          - Espaciado entre elementos (gap-2)
          - Colores de fondo y texto (bg-blue-600, text-white)
          - Padding horizontal y vertical (px-4, py-2)
          - Bordes redondeados (rounded-lg)
          - Efecto hover con cambio de color (hover:bg-blue-700)
          - Transición suave para el cambio de color (transition-colors)
      */}
      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        {/* Icono de Plus (FiPlus) */}
        <FiPlus />
        {/* Texto del botón */}
        Añadir Tema
      </button>
    </Link>
  );
};