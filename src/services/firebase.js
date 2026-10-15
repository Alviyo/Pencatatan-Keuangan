// Firebase Cloud Database Integration
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';

const CONFIG_STORAGE_KEY = 'arthawise_firebase_config';

export function getStoredFirebaseConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored firebase config', e);
  }

  // Check if .env has configs
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }

  return null;
}

export function saveStoredFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } else {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

let dbInstance = null;
let appInstance = null;

export function initFirebase(config = null) {
  const cfg = config || getStoredFirebaseConfig();
  if (!cfg || !cfg.projectId || !cfg.apiKey) {
    dbInstance = null;
    appInstance = null;
    return null;
  }

  try {
    if (getApps().length === 0) {
      appInstance = initializeApp(cfg);
    } else {
      appInstance = getApp();
    }
    dbInstance = getFirestore(appInstance);
    return dbInstance;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    dbInstance = null;
    return null;
  }
}

export function getDb() {
  if (!dbInstance) {
    initFirebase();
  }
  return dbInstance;
}

export async function testConnection(config) {
  try {
    // Temporary test app to avoid polluting main state
    const testApp = initializeApp(config, 'testApp_' + Date.now());
    const testDb = getFirestore(testApp);
    const colRef = collection(testDb, 'healthcheck');
    const testDoc = doc(colRef, 'ping');
    await setDoc(testDoc, { ping: true, timestamp: Date.now() });
    await deleteDoc(testDoc);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || 'Koneksi gagal. Periksa konfigurasi Firestore Rules atau API Key.' };
  }
}

// Cloud operations
export async function fetchTransactionsFromCloud() {
  const db = getDb();
  if (!db) return null;

  try {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const list = [];
    snapshot.forEach((docItem) => {
      list.push({ id: docItem.id, ...docItem.data() });
    });
    return list;
  } catch (error) {
    console.error('Error fetching transactions from cloud:', error);
    throw error;
  }
}

export async function saveTransactionToCloud(transaction) {
  const db = getDb();
  if (!db) return false;
  try {
    const docRef = doc(db, 'transactions', String(transaction.id));
    await setDoc(docRef, transaction, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving transaction to cloud:', error);
    throw error;
  }
}

export async function deleteTransactionFromCloud(id) {
  const db = getDb();
  if (!db) return false;
  try {
    const docRef = doc(db, 'transactions', String(id));
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting transaction from cloud:', error);
    throw error;
  }
}

export async function syncBatchToCloud(transactions, wallets, budgets) {
  const db = getDb();
  if (!db) return false;

  try {
    const batch = writeBatch(db);

    // Save transactions
    transactions.forEach((tx) => {
      const docRef = doc(db, 'transactions', String(tx.id));
      batch.set(docRef, tx, { merge: true });
    });

    // Save metadata: wallets & budgets
    const metaRef = doc(db, 'app_metadata', 'settings');
    batch.set(metaRef, { wallets, budgets, lastSynced: new Date().toISOString() }, { merge: true });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Batch sync to cloud failed:', error);
    throw error;
  }
}

export async function fetchMetadataFromCloud() {
  const db = getDb();
  if (!db) return null;

  try {
    const metaRef = doc(db, 'app_metadata', 'settings');
    const snapshot = await getDocs(collection(db, 'app_metadata'));
    let meta = null;
    snapshot.forEach(d => {
      if (d.id === 'settings') meta = d.data();
    });
    return meta;
  } catch (error) {
    console.error('Error fetching metadata from cloud:', error);
    return null;
  }
}
