/**
 * StatCard — Clean Light Theme
 * Nền trắng, icon mang màu semantic, không gradient lòe loẹt.
 */
const StatCard = ({
  icon,
  title,
  value,
  sub,
  growth = null,       // % tăng/giảm. null = không hiển thị
  iconColor = 'text-primary',
  iconBg = 'bg-blue-50',
}) => {
  const growthPositive = growth !== null && growth >= 0;
  const growthIcon = growthPositive ? 'trending_up' : 'trending_down';
  const growthColor = growthPositive ? 'text-green-600' : 'text-red-500';
  const growthBg = growthPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-md transition-shadow duration-300 p-6 group">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-3xl font-black text-slate-900 mb-1 truncate">
            {value}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {growth !== null && (
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${growthBg} ${growthColor}`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {growthIcon}
                </span>
                {Math.abs(growth)}%
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium truncate">
              {sub}
            </span>
          </div>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
        >
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
