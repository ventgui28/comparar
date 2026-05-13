import { openDB } from 'idb';

const DB_NAME = 'TonerAppDB';
const ACTIVE_FILES_STORE = 'activeFiles';
const PRICE_HISTORY_STORE = 'priceHistory';

export const initDB = async () => {
  console.log('db.js: initDB executing...');
  const db = await openDB(DB_NAME, 2, {
    upgrade(db) {
      console.log('db.js: upgrade starting');
      if (!db.objectStoreNames.contains(ACTIVE_FILES_STORE)) {
        db.createObjectStore(ACTIVE_FILES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PRICE_HISTORY_STORE)) {
        db.createObjectStore(PRICE_HISTORY_STORE, { keyPath: 'id' });
      }
      console.log('db.js: upgrade done');
    },
  });
  console.log('db.js: initDB open complete');
  return db;
};

export const savePriceHistory = async (prodId, price, shopId) => {
  const db = await initDB();
  const tx = db.transaction(PRICE_HISTORY_STORE, 'readwrite');
  const store = tx.store;
  const history = (await store.get(prodId)) || { id: prodId, records: [] };
  history.records.push({ price, shopId, date: new Date().toISOString() });
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
  await tx.done; // Property, not function
};

export const loadFiles = async () => {
  console.log('db.js: loadFiles start');
  const db = await initDB();
  console.log('db.js: initDB done');
  const result = await db.getAll(ACTIVE_FILES_STORE);
  console.log('db.js: loadFiles result:', result);
  return result;
};
