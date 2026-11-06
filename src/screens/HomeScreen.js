import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AppIcon from '../components/AppIcon';
import { isNativeScannerAvailable } from '../services/scannerService';

export default function HomeScreen({
  documents,
  onSelectDocument,
  onScanNew,
  onImportGallery,
  onDeleteDocument,
  isBusy,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const nativeAvailable = isNativeScannerAvailable();

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const confirmDelete = (doc) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteDocument(doc.id),
        },
      ]
    );
  };

  const renderDocumentItem = ({ item }) => {
    const thumbnailUri = item.pages && item.pages.length > 0 ? item.pages[0] : null;
    const dateLabel = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => onSelectDocument(item)}
      >
        <View style={styles.thumbnailWrapper}>
          {thumbnailUri ? (
            <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
          ) : (
            <View style={styles.placeholderThumbnail}>
              <AppIcon name="document-text-outline" size={28} color="#94A3B8" />
            </View>
          )}
          <View style={styles.pageCountBadge}>
            <Text style={styles.pageCountText}>{item.pages?.length || 0}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.docTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.docMeta}>
            {dateLabel} • {item.pages?.length || 0}{' '}
            {item.pages?.length === 1 ? 'page' : 'pages'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteIconBtn}
          onPress={() => confirmDelete(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppIcon name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DocScanner</Text>
          <Text style={styles.headerSubtitle}>
            {nativeAvailable
              ? 'AI Auto-Crop Scanner Active'
              : 'Camera & Crop Mode (Expo Go)'}
          </Text>
        </View>
        <View style={styles.countChip}>
          <Text style={styles.countChipText}>{documents.length} Docs</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <AppIcon name="search-outline" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search scanned documents..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <AppIcon name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Document List or Empty State */}
      {filteredDocs.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <AppIcon name="scan-outline" size={44} color="#2563EB" />
          </View>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No matching documents' : 'No scanned documents yet'}
          </Text>
          <Text style={styles.emptyDescription}>
            {searchQuery
              ? 'Try searching for a different document name.'
              : 'Tap "Scan Document" below to capture pages with your camera or import photos from your gallery.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDocs}
          keyExtractor={(item) => item.id}
          renderItem={renderDocumentItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={onImportGallery}
          disabled={isBusy}
        >
          <AppIcon name="images-outline" size={20} color="#1E293B" />
          <Text style={styles.secondaryBtnText}>Import Photos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.primaryBtn]}
          onPress={onScanNew}
          disabled={isBusy}
        >
          {isBusy ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <AppIcon name="camera-outline" size={22} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Scan Document</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  countChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumbnailWrapper: {
    width: 58,
    height: 74,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderThumbnail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageCountBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pageCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  deleteIconBtn: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  primaryBtn: {
    flex: 1.4,
    backgroundColor: '#2563EB',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

