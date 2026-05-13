import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComparisonTable from './Table/ComparisonTable';
import React from 'react';

// Mock data
const comparisonData = [{
    id: 'prod1',
    desc: 'Toner Preto X',
    prices: { 'f1': 10, 'f2': 15 },
    refs: { 'f1': 'REF1', 'f2': 'REF2' },
    rowNumbers: { 'f1': 1, 'f2': 1 }
}];
const activeFiles = [{ id: 'f1', name: 'File 1' }, { id: 'f2', name: 'File 2' }];

describe('ComparisonTable', () => {
  test('renders favorite star column and toggles state', () => {
      // This will fail currently as the column doesn't exist
      render(<ComparisonTable 
          comparisonData={comparisonData} 
          activeFiles={activeFiles} 
          onAddToCart={() => {}}
          favorites={[]}
          onToggleFavorite={() => {}}
      />);
      
      expect(screen.getByRole('columnheader', { name: /favorito/i })).toBeDefined();
  });
});
