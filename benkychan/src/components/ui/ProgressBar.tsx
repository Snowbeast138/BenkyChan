/**
 * ProgressBar Component
 * 
 * A customizable progress bar with percentage display and gradient styling.
 * 
 * Features:
 * - Visual representation of progress with gradient coloring
 * - Percentage display label
 * - Responsive design
 * - Accessible for screen readers
 * - Smooth width transitions (when progress changes)
 * 
 * Accessibility:
 * - ARIA attributes for screen readers
 * - Proper labeling of progress status
 * - Semantic HTML structure
 * 
 * @param {Object} props - Component props
 * @param {number} props.progress - Current progress percentage (0-100)
 * 
 * @example
 * <ProgressBar progress={65} />
 */
export const ProgressBar = ({ progress }: ProgressBarProps) => {
  // Ensure progress stays within valid bounds (0-100)
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="mb-4" role="progressbar" aria-valuenow={clampedProgress} 
         aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${clampedProgress}% completado`}>
      {/* Progress labels */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Completado</span>
        <span className="text-sm font-bold text-blue-600">{clampedProgress}%</span>
      </div>

      {/* Progress track */}
      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
        {/* Progress indicator with gradient */}
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

interface ProgressBarProps {
  /**
   * Current progress percentage (0-100)
   * @minimum 0
   * @maximum 100
   */
  progress: number;
}