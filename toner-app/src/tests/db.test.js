import { describe, it, expect, vi } from 'vitest';
import { savePriceHistory } from '../utils/db';
import { openDB } from 'idb';

// Mock idb e a base de dados
vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

describe('Histórico de Preços (db.js)', () => {
  it('deve guardar histórico apenas para produtos favoritos', async () => {
    const mockDb = {
      transaction: vi.fn().mockReturnValue({
        store: {
          get: vi.fn().mockResolvedValue(null),
          put: vi.fn().mockResolvedValue(null),
        },
        done: Promise.resolve(),
      }),
    };
    openDB.mockResolvedValue(mockDb);

    const favorites = ['prod1'];
    await savePriceHistory('prod2', 10.00, favorites); // prod2 não é favorito

    expect(mockDb.transaction).not.toHaveBeenCalled();
  });

  it('deve respeitar o limite de 50 registos (janela deslizante)', async () => {
    const existingRecords = Array(50).fill({ price: 10, date: '2026-05-01' });
    const mockDb = {
      transaction: vi.fn().mockReturnValue({
        store: {
          get: vi.fn().mockResolvedValue({ id: 'prod1', records: [...existingRecords] }),
          put: vi.fn().mockResolvedValue(null),
        },
        done: Promise.resolve(),
      }),
    };
    openDB.mockResolvedValue(mockDb);

    await savePriceHistory('prod1', 20.00, ['prod1']);

    expect(mockDb.transaction().store.put).toHaveBeenCalledWith(
      expect.objectContaining({
        records: expect.arrayContaining([{ price: 20.00, date: expect.any(String) }]),
      })
    );
    
    // Verifica se removeu o mais antigo (shift)
    const savedRecords = mockDb.transaction().store.put.mock.calls[0][0].records;
    expect(savedRecords.length).toBe(50);
    expect(savedRecords[0].price).toBe(10); // O primeiro (antigo) foi mantido se eram 50, o novo empurrou
    expect(savedRecords[49].price).toBe(20);
  });
});
