/**
 * Componente LoadingSpinner
 * 
 * Muestra un spinner de carga animado con configuración de tamaño opcional.
 * El spinner consiste en un círculo con un borde azul que gira continuamente.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {number} [props.size=10] - Tamaño del spinner en píxeles (opcional, por defecto 10px)
 * @returns {JSX.Element} - Spinner de carga animado centrado horizontalmente
 */
export const LoadingSpinner = ({ size = 10 }: { size?: number }) => {
  return (
    // Contenedor flex que centra el spinner horizontalmente
    <div className="flex justify-center">
      {/* Elemento del spinner con:
          - Animación de rotación (animate-spin)
          - Forma circular (rounded-full)
          - Borde azul de 4px con un lado transparente para el efecto visual
          - Tamaño configurable mediante props (style)
      */}
      <div
        className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
        style={{ width: `${size}px`, height: `${size}px` }}
      ></div>
    </div>
  );
};