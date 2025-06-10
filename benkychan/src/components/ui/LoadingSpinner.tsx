/**
 * LoadingSpinner Component
 * 
 * A reusable animated loading spinner with customizable size.
 * 
 * Features:
 * - Pure CSS animation (no JavaScript animation libraries required)
 * - Customizable size via props
 * - Responsive by default (centered in parent container)
 * - Accessible for screen readers
 * - Single color (blue-500) that can be easily modified
 * 
 * Accessibility:
 * - Includes ARIA attributes for screen readers
 * - Properly announces loading state
 * 
 * @param {Object} props - Component props
 * @param {number} [props.size=10] - Size of the spinner in pixels
 * @returns {JSX.Element} Animated loading spinner element
 */
export const LoadingSpinner = ({ size = 10 }: { size?: number }) => {
  // Calculate border width relative to spinner size (approx 40% of size)
  const borderWidth = Math.max(2, Math.floor(size * 0.4));

  return (
    <div 
      className="flex justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="animate-spin rounded-full border-blue-500 border-t-transparent"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          borderWidth: `${borderWidth}px`,
        }}
        aria-label="Cargando..."
      >
        {/* Hidden text for screen readers */}
        <span className="sr-only">Cargando contenido...</span>
      </div>
    </div>
  );
};