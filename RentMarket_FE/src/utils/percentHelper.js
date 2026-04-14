/**
 * Phân bổ phần trăm sao cho tổng luôn = 100%.
 * Thuật toán "Largest Remainder Method" (Hamilton).
 *
 * @param {Array<{label: string, count: number}>} items
 * @returns {Array<{label: string, count: number, percent: number}>}
 */
export const distributePercent = (items) => {
  const total = items.reduce((sum, item) => sum + (item.count || 0), 0);

  if (total === 0) {
    return items.map((item) => ({ ...item, percent: 0 }));
  }

  // Tính phần trăm chính xác
  const withExact = items.map((item) => {
    const exact = ((item.count || 0) / total) * 100;
    return {
      ...item,
      exact,
      floored: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });

  // Tổng phần nguyên
  let flooredSum = withExact.reduce((sum, item) => sum + item.floored, 0);
  const diff = 100 - flooredSum;

  // Sắp xếp theo phần dư giảm dần rồi cộng 1 cho đủ 100
  const sorted = [...withExact].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < diff; i++) {
    sorted[i].floored += 1;
  }

  // Trả về kết quả gốc (giữ thứ tự ban đầu)
  return withExact.map(({ exact, remainder, floored, ...rest }) => ({
    ...rest,
    percent: floored,
  }));
};
