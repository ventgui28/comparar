import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clearGranularData } from '../../utils/db';
import { openDB } from 'idb';

vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

describe('clearGranularData', () => {
  let mockDb;
  let mockTx;
  let mockObjectStore;

  beforeEach(() => {
    vi.clearAllMocks();
    mockObjectStore = {
      clear: vi.fn().mockResolvedValue(undefined),
    };
    mockTx = {
      objectStore: vi.fn().mockReturnValue(mockObjectStore),
      done: Promise.resolve(),
    };
    mockDb = {
      transaction: vi.fn().mockReturnValue(mockTx),
    };
    openDB.mockResolvedValue(mockDb);
  });

  it('should clear only specified stores (files)', async () => {
    await clearGranularData({ files: true });

    expect(mockDb.transaction).toHaveBeenCalledWith(['activeFiles'], 'readwrite');
    expect(mockTx.objectStore).toHaveBeenCalledWith('activeFiles');
    expect(mockObjectStore.clear).toHaveBeenCalledTimes(1);
  });

  it('should clear only specified stores (profiles and aliases)', async () => {
    await clearGranularData({ profiles: true, aliases: true });

    expect(mockDb.transaction).toHaveBeenCalledWith(['profiles', 'aliases'], 'readwrite');
    expect(mockTx.objectStore).toHaveBeenCalledWith('profiles');
    expect(mockTx.objectStore).toHaveBeenCalledWith('aliases');
    expect(mockObjectStore.clear).toHaveBeenCalledTimes(2);
  });

  it('should do nothing if no options are provided', async () => {
    await clearGranularData({});

    expect(mockDb.transaction).not.toHaveBeenCalled();
  });

  it('should clear all stores if all options are true', async () => {
    await clearGranularData({ files: true, profiles: true, aliases: true });

    expect(mockDb.transaction).toHaveBeenCalledWith(['activeFiles', 'profiles', 'aliases'], 'readwrite');
    expect(mockObjectStore.clear).toHaveBeenCalledTimes(3);
  });
});
