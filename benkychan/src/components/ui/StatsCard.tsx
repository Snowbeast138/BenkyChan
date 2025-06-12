// Define la interfaz para las propiedades del componente StatsCard
interface StatsCardProps {
  label: string;    // Texto descriptivo que aparece como etiqueta
  value: string;    // Valor principal que se muestra en negrita
}

/**
 * Componente StatsCard
 * 
 * Muestra una tarjeta estadística con:
 * - Una etiqueta descriptiva (pequeña y en color gris)
 * - Un valor principal (en negrita y color gris oscuro)
 * 
 * Estilo:
 * - Fondo blanco con bordes redondeados
 * - Borde sutil gris claro
 * - Padding interno para espaciado
 * 
 * @param {StatsCardProps} props - Propiedades del componente
 * @param {string} props.label - Texto descriptivo de la métrica
 * @param {string} props.value - Valor a mostrar de la métrica
 * @returns {JSX.Element} - Tarjeta visual para mostrar estadísticas
 */
export const StatsCard = ({ label, value }: StatsCardProps) => {
  return (
    // Contenedor principal de la tarjeta con estilos base
    <div className="bg-white p-3 rounded-lg border border-gray-100">
      {/* Etiqueta descriptiva - texto pequeño y color gris */}
      <p className="text-xs text-gray-500">{label}</p>
      
      {/* Valor principal - texto en negrita y color gris oscuro */}
      <p className="font-bold text-gray-800">{value}</p>
    </div>
  );
};