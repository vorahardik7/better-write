'use client';

import { useState } from 'react';
import { signOut, useSession } from '@/lib/auth-client';
import {
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut,
  Loader2,
  Folder,
  FolderPlus,
  X,
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

interface SidebarProps {
  navigationItems: NavigationItem[];
  activeItem: string;
  onSelect: (itemId: string) => void;
  documentCounts?: {
    all: number;
    starred: number;
    recent: number;
    shared: number;
    archive: number;
  };
}

export function Sidebar({ navigationItems, activeItem, onSelect, documentCounts }: SidebarProps) {
  const { data: session } = useSession();
  const [signOutPending, setSignOutPending] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsState, setSettingsState] = useState({
    emailUpdates: true,
    autoSave: true,
    compactSidebar: false,
  });

  const handleSignOut = async () => {
    if (signOutPending) return;
    setSignOutPending(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
      setSignOutPending(false);
    }
  };

  const [folders, setFolders] = useState<Array<{ id: string; name: string; count: number }>>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleSetting = (key: keyof typeof settingsState) => {
    setSettingsState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        count: 0,
      };
      setFolders((prev) => [...prev, newFolder]);
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
  };

  return (
    <aside className="w-80 bg-white border-r border-black/5 h-screen flex flex-col overflow-hidden">
      {/* User Profile Section */}
      <div className="p-6 border-b border-black/5 flex-shrink-0">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{session?.user?.name}</h3>
            <p className="text-sm text-slate-500">{session?.user?.email}</p>
          </div>
        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 overflow-hidden">
        <div className="space-y-1.5 mb-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const getCount = () => {
              if (!documentCounts) return null;
              switch (item.id) {
                case 'all-docs': return documentCounts.all;
                case 'starred': return documentCounts.starred;
                case 'recent': return documentCounts.recent;
                case 'shared': return documentCounts.shared;
                case 'archive': return documentCounts.archive;
                default: return null;
              }
            };
            const count = getCount();
            
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer border border-transparent ${
                  activeItem === item.id
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-700 hover:bg-slate-100 border-black/5'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  {count !== null && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      activeItem === item.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                  {activeItem === item.id && <ChevronRight className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-black/5 pt-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Folders
            </h4>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              <FolderPlus className="w-3 h-3" />
              New
            </button>
          </div>

          <div className="space-y-2">
            {isCreatingFolder && (
              <div className="flex items-center gap-2 p-2 border border-black/10 rounded-lg bg-slate-50">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1 text-sm bg-transparent border-none outline-none placeholder-slate-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateFolder();
                    } else if (e.key === 'Escape') {
                      setIsCreatingFolder(false);
                      setNewFolderName('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  className="text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                  }}
                  className="text-xs font-medium text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            )}
            
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="group flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <button
                  type="button"
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <Folder className="w-4 h-4" />
                  <span className="truncate">{folder.name}</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">{folder.count}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs font-medium text-red-500 hover:text-red-700 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-black/5 flex-shrink-0">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-70"
            onClick={handleSignOut}
            disabled={signOutPending}
          >
            <LogOut className="w-4 h-4" />
            {signOutPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing out...
              </span>
            ) : (
              'Sign Out'
            )}
          </button>
          <button
            type="button"
            onClick={() => window.open('mailto:codezukibusiness@gmail.com')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            Email support (codezukibusiness@gmail.com)
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-black/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Quick settings</h3>
                <p className="text-sm text-slate-500">Tune your workspace preferences.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <label className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-800">Email updates</p>
                  <p className="text-sm text-slate-500">Get notified when collaborators reply.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsState.emailUpdates}
                  onChange={() => toggleSetting('emailUpdates')}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-800">Auto-save</p>
                  <p className="text-sm text-slate-500">Save document changes every 5 seconds.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsState.autoSave}
                  onChange={() => toggleSetting('autoSave')}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-800">Compact sidebar</p>
                  <p className="text-sm text-slate-500">Reduce padding to fit more links.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsState.compactSidebar}
                  onChange={() => toggleSetting('compactSidebar')}
                  className="h-4 w-4"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-black/5 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-black transition-colors"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
