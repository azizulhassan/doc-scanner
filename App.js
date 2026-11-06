import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import DocumentDetailScreen from './src/screens/DocumentDetailScreen';
import {
  scanDocumentWithCamera,
  importDocumentFromGallery,
  rotatePageImage,
} from './src/services/scannerService';
import {
  loadDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from './src/services/storageService';
import { generateAndSharePdf } from './src/services/pdfService';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadDocuments();
      setDocuments(stored);
    })();
  }, []);

  const activeDocument = documents.find((d) => d.id === activeDocId) || null;

  const handleScanNew = useCallback(async () => {
    try {
      setIsBusy(true);
      const scannedUris = await scanDocumentWithCamera();
      if (scannedUris.length === 0) return;

      const { newDoc, documents: nextDocs } = await createDocument(scannedUris);
      setDocuments(nextDocs);
      setActiveDocId(newDoc.id);
    } catch (err) {
      Alert.alert('Scan Error', err.message || 'Could not scan document.');
    } finally {
      setIsBusy(false);
    }
  }, []);

  const handleImportGallery = useCallback(async () => {
    try {
      setIsBusy(true);
      const importedUris = await importDocumentFromGallery();
      if (importedUris.length === 0) return;

      const { newDoc, documents: nextDocs } = await createDocument(importedUris);
      setDocuments(nextDocs);
      setActiveDocId(newDoc.id);
    } catch (err) {
      Alert.alert('Import Error', err.message || 'Could not import photos.');
    } finally {
      setIsBusy(false);
    }
  }, []);

  const handleUpdateDocument = useCallback(async (updatedDoc) => {
    const nextDocs = await updateDocument(updatedDoc);
    setDocuments(nextDocs);
  }, []);

  const handleDeleteDocument = useCallback(
    async (docId) => {
      const nextDocs = await deleteDocument(docId);
      setDocuments(nextDocs);
      if (activeDocId === docId) {
        setActiveDocId(null);
      }
    },
    [activeDocId]
  );

  const handleAddPagesFromCamera = useCallback(async () => {
    if (!activeDocument) return;
    try {
      setIsBusy(true);
      const newUris = await scanDocumentWithCamera();
      if (newUris.length === 0) return;

      const updatedDoc = {
        ...activeDocument,
        pages: [...activeDocument.pages, ...newUris],
      };
      await handleUpdateDocument(updatedDoc);
    } catch (err) {
      Alert.alert('Scan Error', err.message || 'Failed to scan additional pages.');
    } finally {
      setIsBusy(false);
    }
  }, [activeDocument, handleUpdateDocument]);

  const handleAddPagesFromGallery = useCallback(async () => {
    if (!activeDocument) return;
    try {
      setIsBusy(true);
      const newUris = await importDocumentFromGallery();
      if (newUris.length === 0) return;

      const updatedDoc = {
        ...activeDocument,
        pages: [...activeDocument.pages, ...newUris],
      };
      await handleUpdateDocument(updatedDoc);
    } catch (err) {
      Alert.alert('Import Error', err.message || 'Failed to import additional pages.');
    } finally {
      setIsBusy(false);
    }
  }, [activeDocument, handleUpdateDocument]);

  const handleRotatePage = useCallback(
    async (pageIndex) => {
      if (!activeDocument) return;
      const targetUri = activeDocument.pages[pageIndex];
      if (!targetUri) return;

      try {
        setIsBusy(true);
        const rotatedUri = await rotatePageImage(targetUri);
        const nextPages = [...activeDocument.pages];
        nextPages[pageIndex] = rotatedUri;

        await handleUpdateDocument({
          ...activeDocument,
          pages: nextPages,
        });
      } catch (err) {
        Alert.alert('Rotate Error', err.message || 'Could not rotate image.');
      } finally {
        setIsBusy(false);
      }
    },
    [activeDocument, handleUpdateDocument]
  );

  const handleExportPdf = useCallback(async () => {
    if (!activeDocument) return;
    try {
      setIsBusy(true);
      await generateAndSharePdf(activeDocument);
    } catch (err) {
      Alert.alert('PDF Export Error', err.message || 'Failed to generate PDF.');
    } finally {
      setIsBusy(false);
    }
  }, [activeDocument]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {activeDocument ? (
        <DocumentDetailScreen
          document={activeDocument}
          onBack={() => setActiveDocId(null)}
          onUpdateDocument={handleUpdateDocument}
          onAddPagesFromCamera={handleAddPagesFromCamera}
          onAddPagesFromGallery={handleAddPagesFromGallery}
          onRotatePage={handleRotatePage}
          onExportPdf={handleExportPdf}
          isBusy={isBusy}
        />
      ) : (
        <HomeScreen
          documents={documents}
          onSelectDocument={(doc) => setActiveDocId(doc.id)}
          onScanNew={handleScanNew}
          onImportGallery={handleImportGallery}
          onDeleteDocument={handleDeleteDocument}
          isBusy={isBusy}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 24 : 0,
  },
});
