/**
 * @file Componente Test - Muestra un mensaje "Hello World" con estilos atractivos.
 * @module Test
 * @description Componente React funcional que renderiza un mensaje centrado en pantalla completa.
 * @requires react
 */

import React from "react";

/**
 * Componente funcional Test
 * @function Test
 * @returns {JSX.Element} Retorna un contenedor con un mensaje estilizado
 * @example
 * <Test />
 */
export default function Test() {
  return (
    // Contenedor principal:
    // - Ocupa toda la altura de la pantalla (h-screen)
    // - Fondo gris claro (bg-gray-100)
    // - Centrado vertical y horizontalmente (flex + items-center + justify-center)
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {/* Texto "Hello World" con estilos: 
          - Texto blanco en negrita (text-white + font-bold)
          - Tamaño de texto 3xl (text-3xl ~ 1.875rem)
          - Fondo azul oscuro (bg-blue-600)
          - Padding horizontal 8 (px-8 ~ 2rem) y vertical 4 (py-4 ~ 1rem)
          - Bordes redondeados (rounded-lg)
          - Sombra pronunciada (shadow-lg)
      */}
      <h1 className="font-bold text-3xl text-white bg-blue-600 px-8 py-4 rounded-lg shadow-lg">
        Hello World
      </h1>
    </div>
  );
}

// Notas adicionales:
// - Este componente no maneja estado (stateless)
// - No requiere props
// - Ideal para usar como placeholder o pantalla de bienvenida
// - Estilos basados completamente en Tailwind CSS
