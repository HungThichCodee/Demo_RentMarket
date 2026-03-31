/**
 * EmptyState — Clean Light Theme.
 * @param {string} icon - Material Symbols icon name
 */
const EmptyState = ({ icon = 'inbox', title, description, action }) => (
  <div className="bg-white rounded-2xl p-14 text-center border border-gray-100 shadow-sm">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
      <span className="material-symbols-outlined text-slate-300 text-4xl">{icon}</span>
    </div>
    {title && <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>}
    {description && <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
