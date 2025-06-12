// Define la interfaz para las props del componente ProgressBar
interface ProgressBarProps {
  progress: number; // Porcentaje de progreso a mostrar (0-100)
}

/**
 * Componente ProgressBar
 * 
 * Muestra una barra de progreso visual con:
 * - Porcentaje numérico
 * - Barra de progreso con gradiente de color
 * - Etiqueta descriptiva
 * 
 * @param {ProgressBarProps} props - Props del componente
 * @param {number} props.progress - Porcentaje de progreso (0-100)
 * @returns {JSX.Element} - Barra de progreso con información de porcentaje
 */
export const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    // Contenedor principal del componente
    <div className="mb-4">
      {/* Contenedor del texto superior (etiqueta y porcentaje) */}
      <div className="flex justify-between items-center mb-2">
        {/* Etiqueta "Completado" */}
        <span className="text-sm font-medium text-gray-700">Completado</span>
        {/* Porcentaje de progreso con estilo destacado */}
        <span className="text-sm font-bold text-blue-600">{progress}%</span>
      </div>

      {/* Contenedor de la barra de progreso base (fondo gris) */}
      <div className="bg-gray-200 rounded-full h-3">
        {/* Barra de progreso dinámica con:
            - Gradiente de color (azul a morado)
            - Altura fija (h-3)
            - Bordes redondeados (rounded-full)
            - Ancho dinámico basado en el prop 'progress'
        */}
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};