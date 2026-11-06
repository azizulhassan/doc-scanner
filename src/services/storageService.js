import AsyncStorage from '@react-native-async-storage/async-storage';
import { deletePersistedImage } from './scannerService';

const STORAGE_KEY = '@docscanner_documents_v1';

/**
 * Loads all saved documents from local device storage.
 *
 * @returns {Promise<Array<{id: string, title: string, createdAt: string, updatedAt: string, pages: string[]}>>}
 */
export async function loadDocuments() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load documents from storage:', err);
    return [];
  }
}

/**
 * Saves the full list of documents to local device storage.
 */
export async function saveDocuments(documents) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  } catch (err) {
    console.error('Failed to save documents to storage:', err);
  }
}

/**
 * Creates a new scanned document record and prepends it to stored documents.
 *
 * @param {string[]} pageUris - Array of persisted image URIs.
 * @param {string} [customTitle] - Optional title.
 */
export async function createDocument(pageUris, customTitle) {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const newDoc = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: customTitle || `Scan ${formattedDate} ${formattedTime}`,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    pages: pageUris,
  };

  const existing = await loadDocuments();
  const updated = [newDoc, ...existing];
  await saveDocuments(updated);
  return { newDoc, documents: updated };
}

/**
 * Updates a single document by ID and persists the updated list.
 */
export async function updateDocument(updatedDoc) {
  const existing = await loadDocuments();
  const updated = existing.map((doc) =>
    doc.id === updatedDoc.id
      ? { ...updatedDoc, updatedAt: new Date().toISOString() }
      : doc
  );
  await saveDocuments(updated);
  return updated;
}

/**
 * Deletes a document and cleans up all of its persisted page image files from disk.
 */
export async function deleteDocument(docId) {
  const existing = await loadDocuments();
  const target = existing.find((d) => d.id === docId);

  if (target && Array.isArray(target.pages)) {
    for (const pageUri of target.pages) {
      await deletePersistedImage(pageUri);
    }
  }

  const remaining = existing.filter((d) => d.id !== docId);
  await saveDocuments(remaining);
  return remaining;
}
