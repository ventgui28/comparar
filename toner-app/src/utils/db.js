import { openDB } from 'idb';

const DB_NAME = 'TonerAppDB';
const ACTIVE_FILES_STORE = 'activeFiles';
const PRICE_HISTORY_STORE = 'priceHistory';
const PROFILES_STORE = 'profiles';

export const initDB = async () => {
  return openDB(DB_NAME, 3, {
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
    },
  });
};

export const saveProfile = async (profile) => {
  const db = await initDB();
  await db.put(PROFILES_STORE, { ...profile, updatedAt: Date.now() });
};

export const getProfiles = async () => {
  const db = await initDB();
  return db.getAll(PROFILES_STORE);
};

export const deleteProfile = async (name) => {
  const db = await initDB();
  await db.delete(PROFILES_STORE, name);
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
