const EmptyState = ({
  icon = 'inbox',
  title = 'Chưa có dữ liệu',
  description = 'Dữ liệu sẽ hiển thị khi có hoạt động.',
  action = null,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
      <span className="material-symbols-outlined text-gray-300 text-[40px]">
        {icon}
      </span>
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
    <p className="text-sm text-slate-400 max-w-sm mb-5">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
