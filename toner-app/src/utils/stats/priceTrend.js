export const calculateTrend = (currentPrice, history) => {
  if (!history || !history.records || history.records.length === 0) return null;

  const records = history.records;
  
  // If there's only one record and it matches current price, no trend to show
  if (records.length === 1 && Math.abs(currentPrice - records[0].price) < 0.001) {
    return null;
  }

  const minPrice = Math.min(...records.map(r => r.price));
  const isMin = currentPrice <= minPrice;

  const lastRecord = records[records.length - 1];
  const lastPrice = lastRecord.price;
  const percent = lastPrice === 0 ? 0 : ((currentPrice - lastPrice) / lastPrice) * 100;

  let trend = null;
  // Show fire only if it's the minimum AND we have a history of changes 
  // or if the current price is strictly lower than the historical minimum
  if (isMin && (records.length > 1 || currentPrice < minPrice - 0.001)) {
    trend = { type: 'min', percent };
  } else if (Math.abs(percent) >= 0.5) { // Increased threshold to 0.5% as per UI feedback
    trend = { type: percent > 0 ? 'up' : 'down', percent };
  }

  return trend;
};
