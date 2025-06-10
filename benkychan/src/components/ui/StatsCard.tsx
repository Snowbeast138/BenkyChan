/**
 * StatsCard Component
 * 
 * A card component for displaying statistical information with a label and value.
 * 
 * Features:
 * - Clean, minimalist design with subtle border
 * - Responsive layout
 * - Semantic HTML structure
 * - Type-safe props
 * - Accessible markup
 * 
 * Accessibility:
 * - Proper HTML structure using <dl>, <dt>, <dd>
 * - ARIA attributes where applicable
 * - Clear visual hierarchy
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - The description label for the statistic
 * @param {string} props.value - The value to display
 * 
 * @example
 * <StatsCard label="Total Users" value="1,234" />
 */
export const StatsCard = ({ label, value }: StatsCardProps) => {
  return (
    <div 
      className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs hover:shadow-sm transition-shadow"
      role="group"
      aria-label={`Statistic: ${label}`}
    >
      <dl className="space-y-1">
        <dt className="text-xs font-medium text-gray-500">{label}</dt>
        <dd className="text-2xl font-bold text-gray-800">{value}</dd>
      </dl>
    </div>
  );
};

interface StatsCardProps {
  /**
   * The description label for the statistic
   * @example "Total Users"
   */
  label: string;
  
  /**
   * The value to display
   * @example "1,234"
   */
  value: string;
}