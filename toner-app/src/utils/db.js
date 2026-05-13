import { openDB } from 'idb';

const DB_NAME = 'TonerAppDB';
const ACTIVE_FILES_STORE = 'activeFiles';
const PRICE_HISTORY_STORE = 'priceHistory';

export const initDB = async () => {
  return openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ACTIVE_FILES_STORE)) {
        db.createObjectStore(ACTIVE_FILES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PRICE_HISTORY_STORE)) {
        db.createObjectStore(PRICE_HISTORY_STORE, { keyPath: 'id' });
      }
    },
  });
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
  
  // Find record for today
  const todayIdx = history.records.findIndex(r => r.date.split('T')[0] === today);

  if (todayIdx > -1) {
    // Only update if the new price is LOWER than the existing record for today
    if (price < history.records[todayIdx].price - 0.001) {
      history.records[todayIdx] = { price, date: now.toISOString() };
    } else {
      // Current or higher price found, skip update
      await tx.done;
      return;
    }
  } else {
    // New record for a new day
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
