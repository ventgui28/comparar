export const calculateTrend = (currentPrice, history) => {
  if (!history || !history.records || history.records.length === 0) return null;

  const records = history.records;
  
  if (records.length === 1 && Math.abs(currentPrice - records[0].price) < 0.001) {
    return null;
  }

  const minPrice = Math.min(...records.map(r => r.price));
  const isMin = currentPrice <= minPrice;

  const lastRecord = records[records.length - 1];
  const lastPrice = lastRecord.price;
  const percent = lastPrice === 0 ? 0 : ((currentPrice - lastPrice) / lastPrice) * 100;

  let trend = null;
  if (isMin && (records.length > 1 || currentPrice < minPrice - 0.001)) {
    trend = { type: 'min', percent };
  } else if (Math.abs(percent) >= 0.5) {
    trend = { type: percent > 0 ? 'up' : 'down', percent };
  }

  return trend;
};
