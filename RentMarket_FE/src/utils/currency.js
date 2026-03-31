/**
 * Format số tiền sang định dạng tiền Việt Nam (VND).
 * @param {number} amount - Số tiền
 * @returns {string} Chuỗi đã format, ví dụ: "1.000.000₫"
 */
export const formatVND = (amount) => {
  if (amount == null || isNaN(amount)) return '0₫';
  return Number(amount).toLocaleString('vi-VN') + '₫';
};
