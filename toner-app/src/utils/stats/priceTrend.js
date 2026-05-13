export const calculateTrend = (currentPrice, history) => {
  if (!history || !history.records || history.records.length === 0) return null;

  const records = history.records;
  const minPrice = Math.min(...records.map(r => r.price));
  const isMin = currentPrice <= minPrice;

  const lastRecord = records[records.length - 1];
  const lastPrice = lastRecord.price;
  const percent = lastPrice === 0 ? 0 : ((currentPrice - lastPrice) / lastPrice) * 100;

  let trend = null;
  if (isMin) {
    trend = { type: 'min', percent };
  } else if (Math.abs(percent) >= 0.01) { // 0.01% threshold for significance
    trend = { type: percent > 0 ? 'up' : 'down', percent };
  }

  return trend;
};
