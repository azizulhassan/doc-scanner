# DocScanner Mobile App

A cross-platform **React Native (Expo)** mobile application for scanning documents, managing multi-page scans, and exporting them to PDF — built to run **100% on-device with zero recurring operational or cloud costs**.

---

## ✨ Current Features

- **Camera Document Scanning**: Capture documents directly with the device camera and crop/adjust boundaries.
- **Photo Library Import**: Import single or multiple document photos from the phone gallery.
- **Multi-Page Document Management**:
  - Combine multiple scanned pages into a single document.
  - Add new pages (via camera or gallery) to an existing document.
  - Reorder pages (`Move Left` / `Move Right`).
  - Rotate individual pages 90° clockwise.
  - Inspect pages in a full-screen preview modal.
  - Rename and delete documents or individual pages.
- **Offline A4 PDF Generation & Sharing**: Convert any single-page or multi-page scan into a clean A4 PDF file on-device and share/save it using the native OS share sheet.
- **Persistent On-Device Storage**: Automatically stores scanned images in persistent local storage and metadata in `AsyncStorage`.

---

## 🗺️ Roadmap

- [x] **Phase 1**: Document scanning, image rotation, multi-page organization, local storage, and PDF export.
- [ ] **Phase 2**: On-device OCR text extraction and offline **PDF-to-Word (`.docx`)** conversion.

---

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- **Camera & Gallery**: `expo-image-picker`, `react-native-document-scanner-plugin`
- **Image Processing**: `expo-image-manipulator`
- **File System & Persistence**: `expo-file-system`, `@react-native-async-storage/async-storage`
- **PDF Export & Sharing**: `expo-print`, `expo-sharing`

---

## 📂 Project Structure

```text
doc-scanner-app/
├── App.js                              # Root component & navigation state
├── app.json                            # Expo configuration & permissions
├── babel.config.js                     # Babel preset configuration
├── package.json                        # Project dependencies & scripts
└── src/
    ├── components/
    │   └── AppIcon.js                  # Lightweight zero-dependency icon component
    ├── screens/
    │   ├── HomeScreen.js               # Document list, search bar, and scan/import actions
    │   └── DocumentDetailScreen.js     # Multi-page viewer, page reordering, rotation, PDF export
    └── services/
        ├── scannerService.js           # Camera capture, gallery import, and image rotation
        ├── pdfService.js               # Multi-page HTML-to-A4 PDF generation & native sharing
        └── storageService.js           # Persistent local document storage (AsyncStorage + FileSystem)
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

#### Option A: Test on iPhone / Android with Expo Go (Recommended on Windows)
1. Install **Expo Go** from the iOS App Store or Google Play Store.
2. Start the bundler in tunnel mode (bypasses Windows Firewall issues):
   ```bash
   npx expo start --tunnel --clear
   ```
3. Scan the QR code from the terminal:
   - **iPhone**: Open the native **Camera** app, point it at the QR code, and tap **Open in Expo Go**.
   - **Android**: Open the **Expo Go** app and tap **Scan QR code**.

#### Option B: Run a Native Development Build (Android / iOS)
```bash
# Android (requires Android Studio / USB debugging)
npx expo run:android

# iOS (requires macOS with Xcode)
npx expo run:ios
```

