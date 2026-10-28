import React, { useState, useEffect } from 'react';
import {
  Cloud,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  X,
  FolderOpen,
  LogOut,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSignInButton } from '../common/GoogleSignInButton';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { googleSignIn, logout, getAccessToken, initAuth } from '../../utils/googleAuth';
import {
  DriveFileItem,
  listDriveBackups,
  uploadBackupToDrive,
  downloadDriveBackupContent,
  deleteDriveFile,
  uploadDocumentToDrive,
} from '../../utils/driveService';
import { AppDatabaseState } from '../../types';
import { formatDate } from '../../utils/currency';

interface GoogleDriveHubProps {
  data: AppDatabaseState;
  onRestoreDatabase: (importedState: AppDatabaseState) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const GoogleDriveHub: React.FC<GoogleDriveHubProps> = ({
  data,
  onRestoreDatabase,
  isOpen = true,
  onClose,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [backups, setBackups] = useState<DriveFileItem[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Destructive confirmations (MANDATORY for Workspace guidelines)
  const [fileToRestore, setFileToRestore] = useState<DriveFileItem | null>(null);
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        fetchBackups();
      },
      () => {
        setCurrentUser(null);
        setBackups([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchBackups = async () => {
    setIsLoadingBackups(true);
    try {
      const files = await listDriveBackups();
      setBackups(files);
    } catch (err: any) {
      console.error('Error listing backups:', err);
      // Only set error if user is actually signed in
      if (currentUser) {
        setStatusMessage({ type: 'error', text: err.message || 'Could not fetch Drive backups.' });
      }
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setStatusMessage({ type: 'success', text: `Connected as ${res.user.displayName || res.user.email}!` });
        await fetchBackups();
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Sign in failed. Please try again.' });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setBackups([]);
    setStatusMessage({ type: 'success', text: 'Signed out of Google Drive.' });
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setStatusMessage(null);
    try {
      const file = await uploadBackupToDrive(data);
      setStatusMessage({
        type: 'success',
        text: `Backup "${file.name}" successfully created on Google Drive!`,
      });
      await fetchBackups();
    } catch (err: any) {
      console.error('Backup error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create backup on Drive.' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const executeRestore = async (file: DriveFileItem) => {
    try {
      setIsLoadingBackups(true);
      const backupData = await downloadDriveBackupContent(file.id);
      if (backupData && backupData.transactions && backupData.accounts) {
        onRestoreDatabase(backupData);
        setStatusMessage({
          type: 'success',
          text: `Application successfully restored from "${file.name}"!`,
        });
      } else {
        throw new Error('Downloaded file does not contain valid Daily Life Manager data.');
      }
    } catch (err: any) {
      console.error('Restore error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to restore backup from Drive.' });
    } finally {
      setIsLoadingBackups(false);
      setFileToRestore(null);
    }
  };

  const executeDelete = async (file: DriveFileItem) => {
    try {
      await deleteDriveFile(file.id);
      setStatusMessage({ type: 'success', text: `Deleted "${file.name}" from Google Drive.` });
      await fetchBackups();
    } catch (err: any) {
      console.error('Delete error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete file from Drive.' });
    } finally {
      setFileToDelete(null);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Google Drive Cloud Sync</h2>
            <p className="text-xs text-slate-500">Secure automated backups, restore & receipts storage</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Account Connection Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {currentUser ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google User'}
                  className="w-11 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center">
                  {(currentUser.displayName || currentUser.email || 'G').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentUser.displayName || 'Google Account'}
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    Connected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateBackup}
                disabled={isBackingUp}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isBackingUp ? 'Backing up...' : 'Backup Now'}</span>
              </button>
              <button
                onClick={handleSignOut}
                title="Disconnect Google Account"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 mx-auto flex items-center justify-center">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Connect your Google Drive
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Store private encrypted backups, sync transaction receipts, and access your financial records from any device.
              </p>
            </div>
            <div className="pt-1">
              <GoogleSignInButton onClick={handleSignIn} isLoading={isAuthLoading} />
            </div>
          </div>
        )}
      </div>

      {/* Google Drive Stored Backups List */}
      {currentUser && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Backups on Google Drive ({backups.length})
              </h3>
            </div>
            <button
              onClick={fetchBackups}
              disabled={isLoadingBackups}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {isLoadingBackups ? (
            <p className="text-xs text-slate-400 text-center py-6">Checking Google Drive folder...</p>
          ) : backups.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              No backups found in Google Drive folder "Daily Life Manager". Tap "Backup Now" above to create your first cloud snapshot.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {backups.map((file) => (
                <div key={file.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {file.createdTime ? formatDate(file.createdTime) : 'Saved'} ·{' '}
                      {file.size ? `${(parseInt(file.size, 10) / 1024).toFixed(1)} KB` : 'JSON file'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        title="View on Google Drive"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => setFileToRestore(file)}
                      title="Restore from this backup"
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      Restore
                    </button>
                    <button
                      onClick={() => setFileToDelete(file)}
                      title="Delete from Google Drive"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drive Features & Privacy Info */}
      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <Shield className="w-4 h-4 text-emerald-500" />
          Google Drive Privacy & Permissions
        </div>
        <p className="leading-relaxed">
          Daily Life Manager only accesses its own dedicated folder <strong>"Daily Life Manager"</strong> on your Google Drive. Your other personal files remain completely private and inaccessible. You can disconnect your Google account anytime.
        </p>
      </div>

      {/* Mandatory User Confirmation Dialog for Restore (Destructive operation) */}
      <ConfirmationModal
        isOpen={!!fileToRestore}
        title="Restore Data from Google Drive?"
        message={`Are you sure you want to restore from "${fileToRestore?.name}"? This will overwrite your current device data with the records stored in this Google Drive backup.`}
        confirmLabel="Yes, Restore Data"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (fileToRestore) executeRestore(fileToRestore);
        }}
        onCancel={() => setFileToRestore(null)}
      />

      {/* Mandatory User Confirmation Dialog for File Deletion (Destructive operation) */}
      <ConfirmationModal
        isOpen={!!fileToDelete}
        title="Delete File from Google Drive?"
        message={`Are you sure you want to permanently delete "${fileToDelete?.name}" from your Google Drive? This action cannot be undone.`}
        confirmLabel="Delete from Drive"
        cancelLabel="Keep File"
        isDestructive={true}
        onConfirm={() => {
          if (fileToDelete) executeDelete(fileToDelete);
        }}
        onCancel={() => setFileToDelete(null)}
      />
    </div>
  );
};
