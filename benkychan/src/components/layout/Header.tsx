/**
 * Componente Header - Cabecera principal de la aplicación
 * 
 * Muestra el logotipo de la aplicación (icono de premio con el nombre BenkyChan),
 * el eslogan "Aprende a Aprender" y el botón de cierre de sesión.
 * 
 * Características:
 * - Diseño responsive que se adapta a móvil/escritorio (flex-col en móvil, flex-row en escritorio)
 * - Icono de premio (FiAward) de react-icons con fondo azul
 * - Tipografía destacada para el nombre de la aplicación
 * - Integra el componente LogoutButton para la gestión de sesión
 * 
 * Estilos Tailwind CSS:
 * - Diseño flex con diferentes direcciones según breakpoint (flex-col md:flex-row)
 * - Espaciado responsive (gap-4, mb-8)
 * - Colores corporativos (blue-600, blue-800, gray-600)
 * - Padding y bordes redondeados para el icono (p-2, rounded-lg)
 * - Tipografía (text-3xl, font-bold)
 */
import { FiAward } from "react-icons/fi";
import { LogoutButton } from "../auth/LogoutButton";

export const Header = () => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white p-2 rounded-lg">
          <FiAward className="text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-blue-800">BenkyChan</h1>
          <p className="text-gray-600">Aprende a Aprender</p>
        </div>
      </div>
      <LogoutButton />
    </header>
  );
};