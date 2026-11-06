import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/**
 * Converts an array of scanned page image URIs into a multi-page A4 PDF document
 * completely offline on the device, and opens the native share/save dialog.
 *
 * @param {object} document - Document object containing `title` and `pages` (array of URIs).
 * @returns {Promise<string>} Local file URI of the generated PDF.
 */
export async function generateAndSharePdf(document) {
  if (!document || !document.pages || document.pages.length === 0) {
    throw new Error('Cannot generate a PDF from an empty document.');
  }

  // Convert each local image URI to a Base64 data URL so the WebView renderer inside
  // expo-print can embed every page reliably on both Android and iOS.
  const pageHtmlBlocks = [];
  for (let i = 0; i < document.pages.length; i++) {
    const pageUri = document.pages[i];
    const base64 = await FileSystem.readAsStringAsync(pageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    pageHtmlBlocks.push(`
      <div class="page">
        <img src="data:image/jpeg;base64,${base64}" class="scan-image" />
      </div>
    `);
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(document.title || 'Scanned Document')}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            width: 100%;
            background: #ffffff;
          }
          .page {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            page-break-after: always;
            padding: 12px;
          }
          .page:last-child {
            page-break-after: auto;
          }
          .scan-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        ${pageHtmlBlocks.join('\n')}
      </body>
    </html>
  `;

  const { uri: tempPdfUri } = await Print.printToFileAsync({
    html: htmlContent,
    base64: false,
  });

  // Rename the PDF file to match the document title so it has a clean filename when shared
  const safeName = (document.title || 'Scan')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_') || 'Scan';
  const targetPdfUri = `${FileSystem.cacheDirectory}${safeName}.pdf`;

  await FileSystem.moveAsync({
    from: tempPdfUri,
    to: targetPdfUri,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(targetPdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: `Share ${document.title}`,
      UTI: 'com.adobe.pdf',
    });
  }

  return targetPdfUri;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
