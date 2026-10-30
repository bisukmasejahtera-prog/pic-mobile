import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'erp-bisukma-grup',
  appId: env.VITE_FIREBASE_APP_ID || '1:463521761065:web:413635ab51704322a41938',
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyACTV2TLueHjEbgSs3yryuTPzTroygstWo',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'erp-bisukma-grup.firebaseapp.com',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'erp-bisukma-grup.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '463521761065',
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

export { app, db, auth };

/**
 * Recursively remove undefined values from an object
 * Cloud Firestore setDoc/updateDoc fails if any field has value undefined.
 */
export function sanitizeFirestoreData<T extends Record<string, any>>(data: T): Partial<T> {
  if (!data || typeof data !== 'object') return data;
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        sanitized[key] = sanitizeFirestoreData(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
}

/**
 * Save / Merge a document in Firestore
 */
export async function saveDocument(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    const cleaned = sanitizeFirestoreData(data);
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.error(`Error saving document ${docId} to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Delete a document from Firestore
 */
export async function deleteDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Get all documents from a collection
 */
export async function getCollectionDocs(collectionName: string): Promise<any[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    throw error;
  }
}
