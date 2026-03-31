/**
 * LoadingSpinner — Clean Light Theme.
 * @param {'sm'|'md'|'lg'} size
 */
const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'h-5 w-5 border-2',
    md: 'h-9 w-9 border-2',
    lg: 'h-12 w-12 border-2',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-slate-100 border-t-[#1b64f2] ${sizeMap[size]}`}
      />
    </div>
  );
};

export default LoadingSpinner;
