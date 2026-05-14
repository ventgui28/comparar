import { describe, it, expect } from 'vitest';
import { groupAndCompareProducts } from '../../utils/productUtils';

describe('groupAndCompareProducts - Hybrid Matching', () => {
  it('should group products if their reference matches, even if names differ', () => {
    const activeFiles = [
      {
        id: 'file1',
        name: 'File 1',
        data: [{ ref: 'SAME-REF', desc: 'Product A', price: 10, rowIdx: 1 }]
      },
      {
        id: 'file2',
        name: 'File 2',
        data: [{ ref: 'SAME-REF', desc: 'Product B', price: 12, rowIdx: 2 }]
      }
    ];

    const results = groupAndCompareProducts(activeFiles, '');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('sameref');
  });

  it('should group products if their name matches, even if references differ', () => {
    const activeFiles = [
      {
        id: 'file1',
        name: 'File 1',
        data: [{ ref: 'REF-A', desc: 'Same Name', price: 10, rowIdx: 1 }]
      },
      {
        id: 'file2',
        name: 'File 2',
        data: [{ ref: 'REF-B', desc: 'Same Name', price: 12, rowIdx: 2 }]
      }
    ];

    const results = groupAndCompareProducts(activeFiles, '');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('refa');
  });

  it('should group products and link them via a bridge item', () => {
    const activeFiles = [
      {
        id: 'file1',
        name: 'File 1',
        data: [{ ref: 'REF-X', desc: 'Product A', price: 10, rowIdx: 1 }]
      },
      {
        id: 'file2',
        name: 'File 2',
        data: [{ ref: 'REF-Y', desc: 'Product A', price: 12, rowIdx: 2 }]
      },
      {
        id: 'file3',
        name: 'File 3',
        data: [{ ref: 'REF-Y', desc: 'Product B', price: 15, rowIdx: 3 }]
      }
    ];

    const results = groupAndCompareProducts(activeFiles, '');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('refx');
  });
});
