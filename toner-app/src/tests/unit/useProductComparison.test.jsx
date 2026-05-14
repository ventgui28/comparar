import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProductComparison } from '../../hooks/useProductComparison';

describe('useProductComparison', () => {
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

    const { result } = renderHook(() => useProductComparison(activeFiles, ''));

    expect(result.current.length).toBe(1);
    expect(result.current[0].id).toBe('toner 17a');
    expect(result.current[0].prices['file1']).toBe(10);
    expect(result.current[0].prices['file2']).toBe(12);
  });

  it('should use description as key if reference is missing', () => {
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

    const { result } = renderHook(() => useProductComparison(activeFiles, ''));

    expect(result.current.length).toBe(1);
    expect(result.current[0].id).toBe('generic toner');
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

    const { result } = renderHook(() => useProductComparison(activeFiles, '217'));

    expect(result.current.length).toBe(1);
    expect(result.current[0].id).toBe('toner 17a');
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
      'toner 17a': {
        records: [
          { date: '2024-01-01', price: 10 }
        ]
      }
    };

    const { result } = renderHook(() => useProductComparison(activeFiles, 'CF217A', [], priceHistory));

    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current[0].trend).not.toBeNull();
    expect(result.current[0].trend.type).toBe('min');
    expect(result.current[0].trend.percent).toBeCloseTo(-10);
  });
});
