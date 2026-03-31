/**
 * Format ngày sang định dạng dd-MM-yy.
 * @param {string} dateStr - Chuỗi ngày (ISO, yyyy-MM-dd, hoặc datetime)
 * @returns {string} Chuỗi đã format, ví dụ: "28-03-26"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}-${mm}-${yy}`;
  } catch {
    return dateStr;
  }
};

/**
 * Format ngày giờ sang định dạng dd-MM-yy HH:mm.
 * @param {string} dateStr - Chuỗi datetime (ISO)
 * @returns {string} Chuỗi đã format, ví dụ: "28-03-26 20:30"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yy} ${hh}:${min}`;
  } catch {
    return dateStr;
  }
};
