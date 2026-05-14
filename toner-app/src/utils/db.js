import { openDB } from 'idb';

const DB_NAME = 'TonerAppDB';
const ACTIVE_FILES_STORE = 'activeFiles';
const PROFILES_STORE = 'profiles';
const ALIASES_STORE = 'aliases';

export const initDB = async () => {
  return openDB(DB_NAME, 4, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ACTIVE_FILES_STORE)) {
        db.createObjectStore(ACTIVE_FILES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PROFILES_STORE)) {
        db.createObjectStore(PROFILES_STORE, { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains(ALIASES_STORE)) {
        db.createObjectStore(ALIASES_STORE, { keyPath: 'sourceId' });
      }
    },
  });
};

export const getAliases = async () => {
  try {
    const db = await initDB();
    return await db.getAll(ALIASES_STORE);
  } catch (error) {
    console.error('Error getting aliases:', error);
    return [];
  }
};

export const saveAlias = async (sourceId, targetId, targetName) => {
  try {
    const db = await initDB();
    await db.put(ALIASES_STORE, { sourceId, targetId, targetName, updatedAt: Date.now() });
  } catch (error) {
    console.error('Error saving alias:', error);
    throw error;
  }
};

export const deleteAlias = async (sourceId) => {
  try {
    const db = await initDB();
    await db.delete(ALIASES_STORE, sourceId);
  } catch (error) {
    console.error('Error deleting alias:', error);
    throw error;
  }
};

export const deleteAliasesByTarget = async (targetId) => {
  try {
    const db = await initDB();
    const tx = db.transaction(ALIASES_STORE, 'readwrite');
    const index = tx.store;
    let cursor = await index.openCursor();
    
    while (cursor) {
      if (cursor.value.targetId === targetId) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
    await tx.done;
  } catch (error) {
    console.error('Error deleting aliases by target:', error);
    throw error;
  }
};

export const saveProfile = async (profile) => {
  try {
    const db = await initDB();
    await db.put(PROFILES_STORE, { ...profile, updatedAt: Date.now() });
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

export const getProfiles = async () => {
  try {
    const db = await initDB();
    return await db.getAll(PROFILES_STORE);
  } catch (error) {
    console.error('Error getting profiles:', error);
    return [];
  }
};

export const deleteProfile = async (name) => {
  try {
    const db = await initDB();
    await db.delete(PROFILES_STORE, name);
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
};

export const saveFiles = async (files) => {
  const db = await initDB();
  const tx = db.transaction(ACTIVE_FILES_STORE, 'readwrite');
  await tx.store.clear();
  for (const file of files) {
    await tx.store.add(file);
  }
  await tx.done;
};

export const loadFiles = async () => {
  const db = await initDB();
  return db.getAll(ACTIVE_FILES_STORE);
};

export const clearGranularData = async (options) => {
  const db = await initDB();
  const storesToClear = [];
  if (options.files) storesToClear.push(ACTIVE_FILES_STORE);
  if (options.profiles) storesToClear.push(PROFILES_STORE);
  if (options.aliases) storesToClear.push(ALIASES_STORE);

  if (storesToClear.length === 0) return;

  const tx = db.transaction(storesToClear, 'readwrite');
  await Promise.all(storesToClear.map(store => tx.objectStore(store).clear()));
  await tx.done;
};

export const clearAllData = async () => {
  const db = await initDB();
  const tx = db.transaction([ACTIVE_FILES_STORE, PROFILES_STORE, ALIASES_STORE], 'readwrite');
  await Promise.all([
    tx.objectStore(ACTIVE_FILES_STORE).clear(),
    tx.objectStore(PROFILES_STORE).clear(),
    tx.objectStore(ALIASES_STORE).clear()
  ]);
  await tx.done;
};
