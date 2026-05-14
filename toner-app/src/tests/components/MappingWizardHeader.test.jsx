import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import MappingWizardHeader from '../../components/shared/MappingModal/MappingWizardHeader';

describe('MappingWizardHeader', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    fileName: 'test.xlsx',
    activeSlot: 'ref',
    setActiveSlot: vi.fn(),
    selectedSheet: 'Sheet1',
    sheetNames: ['Sheet1'],
    onSheetChange: vi.fn(),
    companyName: '',
    setCompanyName: vi.fn(),
    profiles: []
  };

  it('deve renderizar as instruções iniciais', () => {
    render(<MappingWizardHeader {...defaultProps} />);
    expect(screen.getByText(/Para importar os produtos, selecione cada opção/)).toBeDefined();
  });

  it('deve mostrar a dica correta para o slot ativo', () => {
    const { rerender } = render(<MappingWizardHeader {...defaultProps} />);
    expect(screen.getByText(/Clique na primeira célula com um código de produto/i)).toBeDefined();

    rerender(<MappingWizardHeader {...defaultProps} activeSlot="price" />);
    expect(screen.getByText(/Clique na primeira célula com o valor de venda/i)).toBeDefined();
  });
});
