import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveProfile, getProfiles, deleteProfile } from '../../utils/db';
import { openDB } from 'idb';

vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

describe('DB Profiles Persistence', () => {
  let mockStore;
  let mockDb;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = {
      put: vi.fn(),
      getAll: vi.fn(),
      delete: vi.fn(),
    };
    mockDb = {
      get: vi.fn(),
      put: vi.fn(),
      getAll: vi.fn(),
      delete: vi.fn(),
      transaction: vi.fn().mockReturnValue({
        store: mockStore,
        done: Promise.resolve(),
      }),
    };
    openDB.mockResolvedValue(mockDb);
  });

  it('saveProfile should call db.put with profile data and name as key', async () => {
    const profile = { name: 'Empresa A', mapping: { 'col1': 'field1' } };
    const now = Date.now();
    await saveProfile(profile);
    
    expect(mockDb.put).toHaveBeenCalledWith('profiles', expect.objectContaining({
      name: 'Empresa A',
      mapping: { 'col1': 'field1' },
      updatedAt: expect.any(Number)
    }));

    const savedProfile = mockDb.put.mock.calls[0][1];
    expect(savedProfile.updatedAt).toBeGreaterThanOrEqual(now);
    expect(savedProfile.updatedAt).toBeLessThanOrEqual(Date.now());
  });

  it('getProfiles should return all items from profiles store', async () => {
    const profiles = [{ name: 'A' }, { name: 'B' }];
    mockDb.getAll.mockResolvedValue(profiles);
    
    const result = await getProfiles();
    expect(result).toEqual(profiles);
    expect(mockDb.getAll).toHaveBeenCalledWith('profiles');
  });

  it('deleteProfile should call db.delete with profile name', async () => {
    await deleteProfile('Empresa A');
    expect(mockDb.delete).toHaveBeenCalledWith('profiles', 'Empresa A');
  });
});
