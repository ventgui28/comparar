import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartManager } from '../../components/shared/CartManager';

const mockProducts = [
  {
    id: 'target-id',
    desc: 'Target Product',
    prices: { 'f1': 10 },
    refs: { 'f1': 'REF-T' },
    rowNumbers: { 'f1': 1 }
  }
];

const mockActiveFiles = [{ id: 'f1', name: 'File 1' }];

describe('CartManager', () => {
  test('resolves multiple source-ids pointing to same target-id', () => {
    // Both 'source-1' and 'source-2' are merged into 'target-id'
    const cart = {
      'source-1': { qty: 2, shopId: 'f1' },
      'source-2': { qty: 3, shopId: 'f1' }
    };
    const aliases = [
      { sourceId: 'source-1', targetId: 'target-id', targetName: 'Target Product' },
      { sourceId: 'source-2', targetId: 'target-id', targetName: 'Target Product' }
    ];

    render(
      <CartManager 
        cart={cart} 
        products={mockProducts} 
        activeFiles={mockActiveFiles}
        aliases={aliases}
        isOpen={true}
        onClose={() => {}}
        onUpdateCart={() => {}}
      />
    );

    // Should find "Target Product" for BOTH items
    const itemNames = screen.getAllByText('Target Product');
    expect(itemNames.length).toBe(2);
    
    // Check totals
    expect(screen.getAllByText('10.00€').length).toBeGreaterThan(0);
    expect(screen.getByText('20.00€')).toBeDefined(); // 2 * 10
    expect(screen.getByText('30.00€')).toBeDefined(); // 3 * 10
  });
});
