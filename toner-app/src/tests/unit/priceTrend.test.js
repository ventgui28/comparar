import { describe, it, expect } from 'vitest';
import { calculateTrend } from '../../utils/stats/priceTrend';

describe('calculateTrend', () => {
  it('identifies historical minimum', () => {
    const history = { records: [{ price: 10 }, { price: 12 }] };
    const result = calculateTrend(9, history);
    expect(result.type).toBe('min');
  });

  it('identifies price drop', () => {
    const history = { records: [{ price: 10 }, { price: 12 }] };
    const result = calculateTrend(11, history);
    expect(result.type).toBe('down');
    expect(result.percent).toBeCloseTo(-8.33, 2);
  });

  it('identifies price increase', () => {
    const history = { records: [{ price: 10 }, { price: 12 }] };
    const result = calculateTrend(15, history);
    expect(result.type).toBe('up');
    expect(result.percent).toBe(25);
  });

  it('returns null for no history', () => {
    const result = calculateTrend(10, null);
    expect(result).toBeNull();
  });
});
