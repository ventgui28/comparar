import { openDB } from 'idb';

const DB_NAME = 'TonerAppDB';
const ACTIVE_FILES_STORE = 'activeFiles';
const PRICE_HISTORY_STORE = 'priceHistory';
const PROFILES_STORE = 'profiles';
const ALIASES_STORE = 'aliases';

export const initDB = async () => {
  return openDB(DB_NAME, 4, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ACTIVE_FILES_STORE)) {
        db.createObjectStore(ACTIVE_FILES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PRICE_HISTORY_STORE)) {
        db.createObjectStore(PRICE_HISTORY_STORE, { keyPath: 'id' });
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

export const getPriceHistory = async (prodId) => {
  const db = await initDB();
  const history = await db.get(PRICE_HISTORY_STORE, prodId);
  return history ? history.records : [];
};

export const savePriceHistory = async (prodId, price, favorites) => {
  if (!favorites || !favorites.includes(prodId)) return;

  const db = await initDB();
  const tx = db.transaction(PRICE_HISTORY_STORE, 'readwrite');
  const store = tx.store;
  const history = (await store.get(prodId)) || { id: prodId, records: [] };
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const todayIdx = history.records.findIndex(r => r.date.split('T')[0] === today);

  if (todayIdx > -1) {
    if (price < history.records[todayIdx].price - 0.001) {
      history.records[todayIdx] = { price, date: now.toISOString() };
    } else {
      await tx.done;
      return;
    }
  } else {
    history.records.push({ price, date: now.toISOString() });
  }
  
  if (history.records.length > 50) {
    history.records.shift(); 
  }
  
  await store.put(history);
  await tx.done;
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
