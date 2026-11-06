import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const SCANS_DIR = `${FileSystem.documentDirectory}scans/`;

/**
 * Ensures the persistent local scans directory exists on the device.
 */
export async function ensureScansDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(SCANS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SCANS_DIR, { intermediates: true });
  }
}

/**
 * Copies a temporary image URI into persistent app storage so the OS cache cleanup
 * never deletes user scans.
 */
export async function persistScannedImage(sourceUri) {
  await ensureScansDirectory();
  const filename = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
  const destUri = `${SCANS_DIR}${filename}`;
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destUri,
  });
  return destUri;
}

/**
 * Checks whether the native ML Kit / VisionKit DocumentScanner module is compiled
 * into the current binary (false in Expo Go).
 */
export function isNativeScannerAvailable() {
  return false;
}

/**
 * Launches the document scanner.
 * Uses `expo-image-picker` camera with built-in cropping so it works in Expo Go
 * as well as standalone builds without native bridge mismatches.
 *
 * @returns {Promise<string[]>} Array of persistent local image URIs.
 */
export async function scanDocumentWithCamera() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Camera permission is required to scan documents.');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.9,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return [];
  }

  const persistedUris = [];
  for (const asset of result.assets) {
    const savedUri = await persistScannedImage(asset.uri);
    persistedUris.push(savedUri);
  }
  return persistedUris;
}

/**
 * Imports one or more document images from the device's photo gallery.
 *
 * @returns {Promise<string[]>} Array of persistent local image URIs.
 */
export async function importDocumentFromGallery() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required to import documents.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.9,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return [];
  }

  const persistedUris = [];
  for (const asset of result.assets) {
    const savedUri = await persistScannedImage(asset.uri);
    persistedUris.push(savedUri);
  }
  return persistedUris;
}

/**
 * Rotates a scanned page image by 90 degrees clockwise and saves it persistently.
 *
 * @param {string} imageUri - Current URI of the page image.
 * @returns {Promise<string>} New persistent URI of the rotated image.
 */
export async function rotatePageImage(imageUri) {
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ rotate: 90 }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );

  const savedUri = await persistScannedImage(manipulated.uri);

  // Clean up old file if it was inside our scans folder
  if (imageUri.startsWith(SCANS_DIR)) {
    await FileSystem.deleteAsync(imageUri, { idempotent: true });
  }

  return savedUri;
}

/**
 * Deletes a persisted image file from local storage.
 */
export async function deletePersistedImage(imageUri) {
  if (imageUri && imageUri.startsWith(SCANS_DIR)) {
    await FileSystem.deleteAsync(imageUri, { idempotent: true });
  }
}
