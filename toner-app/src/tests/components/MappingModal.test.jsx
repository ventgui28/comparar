import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import MappingModal from '../../components/shared/MappingModal';
import useMappingState from '../../hooks/useMappingState';

// Mock dependencies
vi.mock('../../hooks/useMappingState');
vi.mock('../../utils/excelParser', () => ({
  finalizeMapping: vi.fn(s => s)
}));

describe('MappingModal Validation', () => {
  const mockMappingState = {
    sheetNames: ['Sheet1'],
    sheetsData: { 'Sheet1': [[]] },
    selectedSheet: 'Sheet1',
    activeSlot: 'ref',
    setActiveSlot: vi.fn(),
    selections: {
      ref: { start: { r: 0, c: 0 }, end: null },
      name: { start: { r: 0, c: 1 }, end: null },
      price: { start: { r: 0, c: 2 }, end: null }
    },
    ignoredRows: new Set(),
    currentData: [[]],
    toggleIgnoreRow: vi.fn(),
    handleCellClick: vi.fn(),
    handleSheetChange: vi.fn(),
    companyName: '',
    setCompanyName: vi.fn(),
    profiles: [],
    handleDeleteProfile: vi.fn(),
    handleSaveProfile: vi.fn(),
    handleProfileSelect: vi.fn(),
    setSelections: vi.fn()
  };

  const defaultProps = {
    excelBundle: { sheetNames: ['Sheet1'], sheetsData: { 'Sheet1': [[]] } },
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    fileName: 'test_supplier.xlsx'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should show warning when company name is empty', async () => {
    useMappingState.mockReturnValue(mockMappingState);
    render(<MappingModal {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirmar Mapeamento');
    fireEvent.click(confirmButton);

    expect(await screen.findByText('Atenção ao Nome do Fornecedor')).toBeDefined();
    expect(screen.getByText(/Não definiu um nome para este fornecedor/)).toBeDefined();
  });

  it('should show warning when company name does not match filename', async () => {
    useMappingState.mockReturnValue({
      ...mockMappingState,
      companyName: 'Wrong Company'
    });
    render(<MappingModal {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirmar Mapeamento');
    fireEvent.click(confirmButton);

    expect(await screen.findByText('Atenção ao Nome do Fornecedor')).toBeDefined();
    expect(screen.getByText(/O nome do fornecedor definido \('Wrong Company'\) não parece coincidir/)).toBeDefined();
  });

  it('should not show warning when company name matches filename', async () => {
    useMappingState.mockReturnValue({
      ...mockMappingState,
      companyName: 'test_supplier'
    });
    render(<MappingModal {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirmar Mapeamento');
    fireEvent.click(confirmButton);

    // Should NOT show warning modal, instead call onConfirm
    await waitFor(() => {
      expect(screen.queryByText('Atenção ao Nome do Fornecedor')).toBeNull();
      expect(defaultProps.onConfirm).toHaveBeenCalled();
    });
  });

  it('should call onConfirm when user clicks continue in warning modal', async () => {
    useMappingState.mockReturnValue(mockMappingState);
    render(<MappingModal {...defaultProps} />);
    
    // 1. Click confirm to show warning
    const confirmButton = screen.getByText('Confirmar Mapeamento');
    fireEvent.click(confirmButton);

    // 2. Click "Continuar sem nome" in the warning modal
    const continueButton = await screen.findByText('Continuar sem nome');
    fireEvent.click(continueButton);

    // 3. Should call onConfirm
    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalled();
    });
  });
});
