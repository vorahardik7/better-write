'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from '@/lib/auth-client';
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Loader2,
  Folder,
  FolderPlus,
  Settings,
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && target.closest('[data-profile-popover]')) {
        return;
      }
      setProfileMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [profileMenuOpen]);

  const handleSignOut = async () => {
    if (signOutPending) return;
    setSignOutPending(true);
    try {
      await signOut();
      // Force redirect to home page after sign out
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to sign out', error);
      setSignOutPending(false);
    }
  };

  const [folders, setFolders] = useState<Array<{ id: string; name: string; count: number }>>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

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
    <aside className="w-80 h-screen flex flex-col overflow-hidden bg-transparent">

      {/* Navigation */}
      <nav className="flex-1 px-6 pt-10 pb-4 overflow-hidden">
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
                onClick={() => {
                  setProfileMenuOpen(false);
                  onSelect(item.id);
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeItem === item.id
                    ? 'bg-[#6a7b57] text-white shadow-[0_8px_24px_rgba(106,123,87,0.4)] border border-[#7a8b67]'
                    : 'text-[#f0f8e8] hover:bg-[rgba(255,255,255,0.12)] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3 cursor-pointer">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
                <div className="flex items-center gap-2 cursor-pointer">
                  {count !== null && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      activeItem === item.id 
                        ? 'text-white' 
                        : 'text-[#d8e5c8]'
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

        <div className="border-t border-[rgba(255,255,255,0.15)] pt-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgba(240,248,232,0.7)]">
              Folders
            </h4>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#d8e5c8] hover:text-white cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              New
            </button>
          </div>

          <div className="space-y-2">
            {isCreatingFolder && (
              <div className="flex items-center gap-2 p-2 border border-[rgba(255,255,255,0.2)] rounded-lg bg-[rgba(255,255,255,0.12)] shadow-[0_8px_18px_rgba(0,0,0,0.15)]">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1 text-sm bg-transparent border-none outline-none placeholder-[rgba(216,229,200,0.7)] text-white"
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
                  className="text-xs font-medium text-[#d8e5c8] hover:text-white"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                  }}
                  className="text-xs font-medium text-[rgba(216,229,200,0.7)] hover:text-[#d8e5c8]"
                >
                  Cancel
                </button>
              </div>
            )}
            
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="group flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-[#d8e5c8] hover:bg-[rgba(255,255,255,0.12)] hover:text-white transition"
              >
                <button
                  type="button"
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <Folder className="w-4 h-4" />
                  <span className="truncate">{folder.name}</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[rgba(216,229,200,0.7)]">{folder.count}</span>
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
      <div
        className="relative p-6 border-t border-[rgba(255,255,255,0.15)] flex-shrink-0 bg-transparent"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setProfileMenuOpen(false);
          }
        }}
        data-profile-popover
      >
        {profileMenuOpen && (
          <div className="absolute bottom-[100px] left-6 right-6 rounded-2xl bg-[#5a6b47] shadow-[0_18px_40px_rgba(0,0,0,0.25)] border border-[rgba(255,255,255,0.15)] pt-3 pb-2">
            <div className="px-5 pb-2 text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-[rgba(216,229,200,0.7)]">Account</p>
              <p className="mt-2 text-sm font-semibold text-white truncate">{session?.user?.name}</p>
            </div>
            <div className="mt-1 flex flex-col gap-1 px-2">
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-[#d8e5c8] hover:bg-[rgba(255,255,255,0.12)] hover:text-white transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors disabled:opacity-70 cursor-pointer"
                onClick={handleSignOut}
                disabled={signOutPending}
              >
                {signOutPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setProfileMenuOpen((prev) => !prev)}
          className="flex w-full items-center gap-3 rounded-2xl bg-[rgba(255,255,255,0.12)] px-4 py-3 text-left transition-colors hover:bg-[rgba(255,255,255,0.18)] cursor-pointer"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(234, 218, 166, 0.8)] text-white font-semibold text-lg shadow-[0_12px_28px_rgba(0,0,0,0.15)]">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white truncate">{session?.user?.name}</p>
            <p className="text-xs text-white">Workspace</p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[rgba(216,229,200,0.8)] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </aside>
  );
}
