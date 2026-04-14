import { useState, useRef, useEffect } from 'react';

/**
 * DateRangePicker — chọn khoảng thời gian.
 * Clean Light Theme, không dark mode.
 */
const presets = [
  { label: '7 ngày', days: 7 },
  { label: '30 ngày', days: 30 },
  { label: '90 ngày', days: 90 },
  { label: 'Năm nay', days: 'ytd' },
];

const formatDate = (d) =>
  d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const DateRangePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePreset = (preset) => {
    const end = new Date();
    let start;
    if (preset.days === 'ytd') {
      start = new Date(end.getFullYear(), 0, 1);
    } else {
      start = new Date();
      start.setDate(start.getDate() - preset.days);
    }
    onChange({ start, end, label: preset.label });
    setOpen(false);
  };

  const displayText = value?.label
    ? value.label
    : value?.start && value?.end
      ? `${formatDate(value.start)} – ${formatDate(value.end)}`
      : 'Chọn khoảng thời gian';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px]">
          calendar_month
        </span>
        {displayText}
        <span className="material-symbols-outlined text-[16px] text-slate-400">
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-gray-100 shadow-card-md p-2 z-50 min-w-[180px]">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                value?.label === preset.label
                  ? 'bg-blue-50 text-primary'
                  : 'text-slate-600 hover:bg-gray-50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
