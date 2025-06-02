interface StatsCardProps {
  label: string;
  value: string;
}

export const StatsCard = ({ label, value }: StatsCardProps) => {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-100">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold text-gray-800">{value}</p>
    </div>
  );
};
