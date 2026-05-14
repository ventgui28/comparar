import { describe, it, expect } from 'vitest';
import { groupAndCompareProducts } from '../../utils/productUtils';

describe('groupAndCompareProducts', () => {
  it('should group products with the same description even if references are different', () => {
    const activeFiles = [
      {
        id: 'file1',
        name: 'File 1',
        data: [
          { ref: 'REF-A', desc: 'Toner 17A', price: 10, rowIdx: 1 }
        ]
      },
      {
        id: 'file2',
        name: 'File 2',
        data: [
          { ref: 'REF-B', desc: 'Toner 17A', price: 12, rowIdx: 2 }
        ]
      }
    ];

    const results = groupAndCompareProducts(activeFiles, '');

    expect(results.length).toBe(1);
    expect(results[0].id).toBe('refa');
    expect(results[0].prices['file1']).toBe(10);
    expect(results[0].prices['file2']).toBe(12);
  });

  it('should group products if reference is same even if description is slightly different', () => {
    const activeFiles = [
      {
        id: 'file1',
        name: 'File 1',
        data: [
          { ref: 'SAME-REF', desc: 'Toner A', price: 10, rowIdx: 1 }
        ]
      },
      {
        id: 'file2',
        name: 'File 2',
        data: [
          { ref: 'SAME-REF', desc: 'Toner B', price: 12, rowIdx: 2 }
        ]
      }
    ];

    const results = groupAndCompareProducts(activeFiles, '');

    expect(results.length).toBe(1);
    expect(results[0].id).toBe('sameref');
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

    const results = groupAndCompareProducts(activeFiles, 'Toner 17A', [], priceHistory);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].trend).not.toBeNull();
    expect(results[0].trend.type).toBe('min');
    expect(results[0].trend.percent).toBeCloseTo(-10);
  });
});
