import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AppIcon from '../components/AppIcon';

export default function DocumentDetailScreen({
  document,
  onBack,
  onUpdateDocument,
  onAddPagesFromCamera,
  onAddPagesFromGallery,
  onRotatePage,
  onExportPdf,
  isBusy,
}) {
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(document.title);
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);

  const pages = document.pages || [];
  const activePageUri = pages[selectedPageIndex] || pages[0] || null;

  const handleSaveTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== document.title) {
      onUpdateDocument({ ...document, title: trimmed });
    } else {
      setTitleDraft(document.title);
    }
    setIsEditingTitle(false);
  };

  const handleDeletePage = (indexToRemove) => {
    if (pages.length <= 1) {
      Alert.alert(
        'Cannot Delete Only Page',
        'A document must have at least one page. Delete the document from the home screen instead.'
      );
      return;
    }

    Alert.alert('Remove Page', `Delete page ${indexToRemove + 1}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const nextPages = pages.filter((_, idx) => idx !== indexToRemove);
          if (selectedPageIndex >= nextPages.length) {
            setSelectedPageIndex(Math.max(0, nextPages.length - 1));
          }
          onUpdateDocument({ ...document, pages: nextPages });
        },
      },
    ]);
  };

  const handleMovePage = (direction) => {
    const targetIndex = selectedPageIndex + direction;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    const reordered = [...pages];
    const [moved] = reordered.splice(selectedPageIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setSelectedPageIndex(targetIndex);
    onUpdateDocument({ ...document, pages: reordered });
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <AppIcon name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          {isEditingTitle ? (
            <TextInput
              style={styles.titleInput}
              value={titleDraft}
              onChangeText={setTitleDraft}
              onBlur={handleSaveTitle}
              onSubmitEditing={handleSaveTitle}
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <TouchableOpacity
              style={styles.titleRow}
              onPress={() => {
                setTitleDraft(document.title);
                setIsEditingTitle(true);
              }}
            >
              <Text style={styles.titleText} numberOfLines={1}>
                {document.title}
              </Text>
              <AppIcon name="pencil-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          )}
          <Text style={styles.subtitleText}>
            Page {selectedPageIndex + 1} of {pages.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.pdfBtn}
          onPress={onExportPdf}
          disabled={isBusy}
        >
          {isBusy ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <AppIcon name="share-outline" size={18} color="#FFFFFF" />
              <Text style={styles.pdfBtnText}>PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Page Preview */}
      <View style={styles.previewArea}>
        {activePageUri ? (
          <TouchableOpacity
            style={styles.previewTouchable}
            activeOpacity={0.9}
            onPress={() => setFullScreenModalVisible(true)}
          >
            <Image source={{ uri: activePageUri }} style={styles.previewImage} />
            <View style={styles.zoomHint}>
              <AppIcon name="expand-outline" size={16} color="#FFFFFF" />
              <Text style={styles.zoomHintText}>Tap to inspect</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noPageText}>No pages in this document</Text>
        )}
      </View>

      {/* Page Manipulation Toolbar */}
      <View style={styles.pageToolbar}>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => onRotatePage(selectedPageIndex)}
          disabled={isBusy}
        >
          <AppIcon name="refresh-outline" size={20} color="#1E293B" />
          <Text style={styles.toolBtnLabel}>Rotate 90°</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolBtn,
            selectedPageIndex === 0 && styles.toolBtnDisabled,
          ]}
          onPress={() => handleMovePage(-1)}
          disabled={selectedPageIndex === 0 || isBusy}
        >
          <AppIcon name="chevron-back-outline" size={20} color="#1E293B" />
          <Text style={styles.toolBtnLabel}>Move Left</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolBtn,
            selectedPageIndex >= pages.length - 1 && styles.toolBtnDisabled,
          ]}
          onPress={() => handleMovePage(1)}
          disabled={selectedPageIndex >= pages.length - 1 || isBusy}
        >
          <AppIcon name="chevron-forward-outline" size={20} color="#1E293B" />
          <Text style={styles.toolBtnLabel}>Move Right</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => handleDeletePage(selectedPageIndex)}
          disabled={isBusy}
        >
          <AppIcon name="trash-outline" size={20} color="#EF4444" />
          <Text style={[styles.toolBtnLabel, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Page Strip + Add Page Controls */}
      <View style={styles.stripSection}>
        <FlatList
          data={pages}
          horizontal
          keyExtractor={(uri, idx) => `${uri}_${idx}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripList}
          renderItem={({ item, index }) => {
            const isSelected = index === selectedPageIndex;
            return (
              <TouchableOpacity
                style={[
                  styles.thumbItem,
                  isSelected && styles.thumbItemSelected,
                ]}
                onPress={() => setSelectedPageIndex(index)}
              >
                <Image source={{ uri: item }} style={styles.thumbImage} />
                <View style={styles.thumbBadge}>
                  <Text style={styles.thumbBadgeText}>{index + 1}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <View style={styles.addPagesGroup}>
              <TouchableOpacity
                style={styles.addPageBtn}
                onPress={onAddPagesFromCamera}
                disabled={isBusy}
              >
                <AppIcon name="camera-outline" size={20} color="#2563EB" />
                <Text style={styles.addPageBtnText}>+ Scan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addPageBtn}
                onPress={onAddPagesFromGallery}
                disabled={isBusy}
              >
                <AppIcon name="images-outline" size={20} color="#2563EB" />
                <Text style={styles.addPageBtnText}>+ Photo</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Fullscreen Page Modal */}
      <Modal
        visible={fullScreenModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setFullScreenModalVisible(false)}
          >
            <AppIcon name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          {activePageUri && (
            <Image
              source={{ uri: activePageUri }}
              style={styles.modalFullImage}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  titleInput: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    borderBottomWidth: 1.5,
    borderBottomColor: '#2563EB',
    paddingVertical: 2,
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  pdfBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  previewArea: {
    flex: 1,
    margin: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  zoomHintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noPageText: {
    color: '#64748B',
    fontSize: 15,
  },
  pageToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  toolBtnDisabled: {
    opacity: 0.35,
  },
  toolBtnLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 4,
  },
  stripSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 12,
  },
  stripList: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  thumbItem: {
    width: 62,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  thumbItemSelected: {
    borderColor: '#2563EB',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  thumbBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  addPagesGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  addPageBtn: {
    width: 64,
    height: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPageBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  modalFullImage: {
    width: '95%',
    height: '85%',
    resizeMode: 'contain',
  },
});

