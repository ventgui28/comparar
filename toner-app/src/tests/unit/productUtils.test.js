import { describe, it, expect } from 'vitest';
import { groupAndCompareProducts } from '../../utils/productUtils';

describe('groupAndCompareProducts', () => {
  it('should group products with different reference formats but same alphanumeric content', () => {
    const activeFiles = [
      {
        id: 'file1',
        name: 'File 1',
        data: [
          { ref: 'CF217A', desc: 'Toner 17A', price: 10, rowIdx: 1 }
        ]
      },
      {
        id: 'file2',
        name: 'File 2',
        data: [
          { ref: 'CF 217-A', desc: 'Toner 17A alternate', price: 12, rowIdx: 2 }
        ]
      }
    ];

    const results = groupAndCompareProducts(activeFiles, '');

    expect(results.length).toBe(1);
    expect(results[0].id).toBe('cf217a');
    expect(results[0].prices['file1']).toBe(10);
    expect(results[0].prices['file2']).toBe(12);
  });

  it('should use description as key if reference is missing and item appears in multiple files', () => {
    const activeFiles = [
      {
        id: 'file1',
        name: 'File 1',
        data: [
          { ref: '', desc: 'Generic Toner', price: 10, rowIdx: 1 }
        ]
      },
      {
        id: 'file2',
        name: 'File 2',
        data: [
          { ref: '', desc: 'Generic Toner', price: 12, rowIdx: 2 }
        ]
      }
    ];

    const results = groupAndCompareProducts(activeFiles, '');

    expect(results.length).toBe(1);
    expect(results[0].id).toBe('generic toner');
  });

  it('should filter results based on search term in reference', () => {
    const activeFiles = [
      {
        id: 'file1',
        name: 'File 1',
        data: [
          { ref: 'CF217A', desc: 'Toner 17A', price: 10, rowIdx: 1 },
          { ref: 'CE285A', desc: 'Toner 85A', price: 15, rowIdx: 2 }
        ]
      }
    ];

    const results = groupAndCompareProducts(activeFiles, '217');

    expect(results.length).toBe(1);
    expect(results[0].id).toBe('cf217a');
  });

  it('should include trend data when priceHistory is provided', () => {
    const activeFiles = [
      {
        id: 'file1',
        name: 'File 1',
        data: [{ ref: 'CF217A', desc: 'Toner 17A', price: 9, rowIdx: 1 }]
      }
    ];

    const priceHistory = {
      'cf217a': {
        records: [
          { date: '2024-01-01', price: 10 }
        ]
      }
    };

    const results = groupAndCompareProducts(activeFiles, 'CF217A', [], priceHistory);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].trend).not.toBeNull();
    expect(results[0].trend.type).toBe('min');
    expect(results[0].trend.percent).toBeCloseTo(-10);
  });
});
