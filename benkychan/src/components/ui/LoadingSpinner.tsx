export const LoadingSpinner = ({ size = 10 }: { size?: number }) => {
  return (
    <div className="flex justify-center">
      <div
        className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
        style={{ width: `${size}px`, height: `${size}px` }}
      ></div>
    </div>
  );
};
