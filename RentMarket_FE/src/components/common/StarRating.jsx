/**
 * Star rating hiển thị 1-5 sao.
 * @param {number} rating - giá trị 1-5
 * @param {string} size - 'sm' | 'md'
 */
const StarRating = ({ rating, size = 'sm' }) => {
  const iconSize = size === 'sm' ? 'text-[16px]' : 'text-[20px]';

  return (
    <div className="flex text-yellow-500">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined ${iconSize} ${i < rating ? 'fill-current' : 'text-gray-300'}`}
        >
          star
        </span>
      ))}
    </div>
  );
};

export default StarRating;
