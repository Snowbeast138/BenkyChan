/**
 * Componente Footer - Pie de página de la aplicación
 * 
 * Muestra un pie de página simple con el nombre de la aplicación, 
 * el lema "Aprende jugando" y el año actual.
 * 
 * El componente utiliza clases de Tailwind CSS para el estilo:
 * - mt-12: margen superior de 3rem (48px)
 * - text-center: texto centrado
 * - text-gray-500: color de texto gris (nivel 500)
 * - text-sm: tamaño de texto pequeño
 * - pb-8: padding inferior de 2rem (32px)
 * 
 * El año se genera dinámicamente usando new Date().getFullYear()
 * para que siempre muestre el año actual.
 */
export const Footer = () => {
  return (
    <footer className="mt-12 text-center text-gray-500 text-sm pb-8">
      <p>BenkyChan - Aprende jugando © {new Date().getFullYear()}</p>
    </footer>
  );
};