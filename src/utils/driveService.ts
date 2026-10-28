import { getAccessToken } from './googleAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

async function getAuthHeader(): Promise<HeadersInit> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('User is not signed in to Google or access token has expired.');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Find or create the "Daily Life Manager" folder in Google Drive
export async function getOrCreateAppFolder(folderName = 'Daily Life Manager'): Promise<string> {
  const headers = await getAuthHeader();

  // Search if folder already exists
  const query = encodeURIComponent(
    `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name)`, {
    headers,
  });

  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to search Google Drive folders');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createRes = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create Google Drive folder');
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

// Upload JSON backup to Google Drive
export async function uploadBackupToDrive(
  data: any,
  fileName?: string
): Promise<DriveFileItem> {
  const headers = await getAuthHeader();
  const folderId = await getOrCreateAppFolder();

  const name =
    fileName ||
    `DailyLifeManager_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const fileContent = JSON.stringify(data, null, 2);

  const metadata = {
    name,
    mimeType: 'application/json',
    parents: [folderId],
    description: 'Daily Life Manager complete database backup',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', new Blob([fileContent], { type: 'application/json' }));

  const res = await fetch(
    `${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: (headers as any).Authorization,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to upload backup to Google Drive');
  }

  return await res.json();
}

// List backups in the app folder
export async function listDriveBackups(): Promise<DriveFileItem[]> {
  const headers = await getAuthHeader();
  const folderId = await getOrCreateAppFolder();

  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const res = await fetch(
    `${DRIVE_API_URL}/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,iconLink)`,
    {
      headers,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to list Google Drive files');
  }

  const data = await res.json();
  return data.files || [];
}

// Download content of a specific backup file
export async function downloadDriveBackupContent(fileId: string): Promise<any> {
  const headers = await getAuthHeader();
  const res = await fetch(`${DRIVE_API_URL}/files/${fileId}?alt=media`, {
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to download file from Google Drive');
  }

  return await res.json();
}

// Delete a file on Google Drive
export async function deleteDriveFile(fileId: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete file from Google Drive');
  }
}

// Upload receipt image (base64) to Google Drive
export async function uploadReceiptImageToDrive(
  base64DataUrl: string,
  fileName: string
): Promise<DriveFileItem> {
  const headers = await getAuthHeader();
  const folderId = await getOrCreateAppFolder();

  // Convert base64 Data URL to Blob
  const parts = base64DataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const imageBlob = new Blob([u8arr], { type: mimeType });

  const metadata = {
    name: fileName,
    mimeType,
    parents: [folderId],
    description: 'Transaction receipt uploaded from Daily Life Manager',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', imageBlob);

  const res = await fetch(
    `${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: (headers as any).Authorization,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to upload receipt to Google Drive');
  }

  return await res.json();
}

// Upload PDF / CSV document to Google Drive
export async function uploadDocumentToDrive(
  blob: Blob,
  fileName: string,
  mimeType: string
): Promise<DriveFileItem> {
  const headers = await getAuthHeader();
  const folderId = await getOrCreateAppFolder();

  const metadata = {
    name: fileName,
    mimeType,
    parents: [folderId],
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', blob);

  const res = await fetch(
    `${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: (headers as any).Authorization,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to save document to Google Drive');
  }

  return await res.json();
}
