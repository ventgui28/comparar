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
    expect(results[0].id).toBe('toner 17a');
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
    expect(results[0].id).toBe('toner a');
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
    expect(results[0].id).toBe('toner 17a');
  });

  it('should redirect products to target group when a manual alias is provided', () => {
    const activeFiles = [
      {
        id: 'file1',
        name: 'File 1',
        data: [{ ref: 'REF-X', desc: 'Product X', price: 10, rowIdx: 1 }]
      },
      {
        id: 'file2',
        name: 'File 2',
        data: [{ ref: 'REF-Y', desc: 'Product Y', price: 12, rowIdx: 2 }]
      }
    ];

    // Create an alias: X -> Y
    const manualAliases = [
      { sourceId: 'product x', targetId: 'product y', targetName: 'Unified Product Name' }
    ];

    const results = groupAndCompareProducts(activeFiles, '', [], manualAliases);

    expect(results.length).toBe(1);
    expect(results[0].id).toBe('product y');
    expect(results[0].desc).toBe('Unified Product Name');
    expect(results[0].prices['file1']).toBe(10);
    expect(results[0].prices['file2']).toBe(12);
  });

  it('should NEVER group products within the same file', () => {
    const activeFiles = [
      {
        id: 'file1',
        name: 'File 1',
        data: [
          { ref: 'REF-A', desc: 'Product 1', price: 10, rowIdx: 1 },
          { ref: 'REF-A', desc: 'Product 1', price: 10, rowIdx: 2 } // Identical to above
        ]
      }
    ];

    const results = groupAndCompareProducts(activeFiles, '');

    expect(results.length).toBe(2);
    expect(results[0].rowNumbers['file1']).toBe(1);
    expect(results[1].rowNumbers['file1']).toBe(2);
  });
});
