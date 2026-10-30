/**
 * Google Drive Upload Utility for PIC Mobile
 * Integrates with Bisukma Group Google Apps Script Webhook
 */

export const GDRIVE_BAHAN_FOLDER_ID = 
  (import.meta as any).env?.VITE_GDRIVE_BAHAN_FOLDER_ID || 
  '1N4RLTmXyhjF_kAU8ZRLMqJQJeA5RULM5';

export const GDRIVE_BAHAN_FOLDER_URL = `https://drive.google.com/drive/folders/${GDRIVE_BAHAN_FOLDER_ID}?usp=sharing`;

export const GDRIVE_KENDALA_FOLDER_ID = 
  (import.meta as any).env?.VITE_GDRIVE_KENDALA_FOLDER_ID || 
  '1ZrdijvtBgPOGrrCoAAuV1yRiXhSzIwRJ';

export const GDRIVE_KENDALA_FOLDER_URL = `https://drive.google.com/drive/folders/${GDRIVE_KENDALA_FOLDER_ID}?usp=sharing`;

export const APPS_SCRIPT_WEBHOOK_URL = 
  (import.meta as any).env?.VITE_GOOGLE_APPS_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycbz6KsFjcpYjU0l6iTWt_BdXnt6zxuRubLPh5qGkoE7yrCq0vLTvGXAJdw79LngqtSQ5iw/exec';

export interface UploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  downloadUrl?: string;
  folderUrl?: string;
  thumbnailUrl?: string;
}

export interface GenerateBahanPhotoFileNameParams {
  isRetur?: boolean;
  tanggal: string; // YYYY-MM-DD
  kodeDapur: string; // e.g. SPPG-TRT-001
  namaBahan: string; // e.g. Daging Ayam Broiler
  jamSampai: string; // e.g. 04:30
  photoIndex?: number; // 1, 2, 3...
}

/**
 * Format automatic standardized file name:
 * BAHAN_[YYYY-MM-DD]_[KODE-DAPUR]_[NAMA-BAHAN]_[JAM]_[NO].jpg
 * RETUR_[YYYY-MM-DD]_[KODE-DAPUR]_[NAMA-BAHAN]_[JAM]_[NO].jpg
 */
export function generateBahanPhotoFileName({
  isRetur = false,
  tanggal,
  kodeDapur,
  namaBahan,
  jamSampai,
  photoIndex = 1
}: GenerateBahanPhotoFileNameParams): string {
  const prefix = isRetur ? 'RETUR' : 'BAHAN';
  const cleanTanggal = (tanggal || new Date().toISOString().split('T')[0]).replace(/[^a-zA-Z0-9-]/g, '');
  const cleanDapur = (kodeDapur || 'DAPUR').replace(/[^a-zA-Z0-9-]/g, '');
  const cleanBahan = (namaBahan || 'Bahan-Baku')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .substring(0, 30);
  const cleanJam = (jamSampai || '00:00').replace(/[^0-9]/g, '');

  return `${prefix}_${cleanTanggal}_${cleanDapur}_${cleanBahan}_${cleanJam}_${photoIndex}.jpg`;
}

/**
 * Convert Blob or File to Base64 String
 */
export function blobToBase64(blob: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Direct Upload to Google Drive via Google Apps Script Webhook
 * Zero Google OAuth popup required for kitchen staff in the field
 */
export async function uploadPhotoToGoogleDrive(
  fileBlob: Blob | File,
  fileName: string,
  folderId: string = GDRIVE_BAHAN_FOLDER_ID,
  description: string = 'Bukti Dokumentasi Penerimaan Bahan Baku SPPG Bisukma'
): Promise<UploadResult> {
  if (!APPS_SCRIPT_WEBHOOK_URL) {
    throw new Error('Google Apps Script Webhook URL belum terkonfigurasi di sistem.');
  }

  const base64Data = await blobToBase64(fileBlob);

  const response = await fetch(APPS_SCRIPT_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      base64Data,
      fileName,
      folderId,
      mimeType: fileBlob.type || 'image/jpeg',
      description
    }),
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`Gagal menghubungi server Google Apps Script (HTTP ${response.status})`);
  }

  const json = await response.json();
  if (!json.success || !json.fileId) {
    throw new Error(json.error || 'Server Google Drive gagal memproses unggahan.');
  }

  return {
    fileId: json.fileId,
    fileName: json.fileName || fileName,
    webViewLink: json.webViewLink || `https://drive.google.com/file/d/${json.fileId}/view`,
    downloadUrl: json.downloadUrl,
    folderUrl: json.folderUrl,
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${json.fileId}&sz=w800`
  };
}

/**
 * Converts a Google Drive file link, file ID, or data URI into a direct displayable image URL
 */
export function getDriveDirectImageUrl(url: string, size: number = 600): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.includes('unsplash.com')) {
    return url;
  }

  // Extract fileId from various Google Drive formats
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                url.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  }

  return url;
}

/**
 * Ensures a Google Drive URL opens the official Google Drive viewer in a new tab
 */
export function getDriveWebLink(url: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                url.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }

  return url;
}
