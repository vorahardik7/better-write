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
    <aside className="w-80 h-screen flex flex-col overflow-hidden border-r border-[rgba(136,153,79,0.12)] bg-[#f7f3e5]">

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
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeItem === item.id
                    ? 'bg-[rgb(136,153,79)] text-white shadow-[0_16px_40px_rgba(52,63,29,0.28)]'
                    : 'text-[rgb(72,84,42)] hover:bg-[rgba(245,247,239,0.55)]'
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
                        : 'text-[rgb(96,108,58)]'
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

        <div className="border-t border-[rgba(136,153,79,0.18)] pt-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[rgba(96,108,58,0.7)]">
              Folders
            </h4>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="inline-flex items-center gap-1 text-sm font-medium text-[rgba(96,108,58,0.85)] hover:text-[rgb(72,84,42)] cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              New
            </button>
          </div>

          <div className="space-y-2">
            {isCreatingFolder && (
              <div className="flex items-center gap-2 p-2 border border-[rgba(136,153,79,0.18)] rounded-lg bg-[rgba(245,247,239,0.75)] shadow-[0_8px_18px_rgba(136,153,79,0.12)]">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1 text-sm bg-transparent border-none outline-none placeholder-[rgba(96,108,58,0.55)] text-[rgb(72,84,42)]"
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
                  className="text-xs font-medium text-[rgb(96,108,58)] hover:text-[rgb(72,84,42)]"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                  }}
                  className="text-xs font-medium text-[rgba(96,108,58,0.55)] hover:text-[rgb(96,108,58)]"
                >
                  Cancel
                </button>
              </div>
            )}
            
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="group flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-[rgb(96,108,58)] hover:bg-[rgba(245,247,239,0.6)] transition"
              >
                <button
                  type="button"
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <Folder className="w-4 h-4" />
                  <span className="truncate">{folder.name}</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[rgba(96,108,58,0.6)]">{folder.count}</span>
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
        className="relative p-6 border-t border-[rgba(136,153,79,0.12)] flex-shrink-0 bg-[#f0ead9]"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setProfileMenuOpen(false);
          }
        }}
        data-profile-popover
      >
        {profileMenuOpen && (
          <div className="absolute bottom-[100px] left-6 right-6 rounded-2xl bg-[#fdf8eb] shadow-[0_18px_40px_rgba(52,63,29,0.22)] border border-[rgba(136,153,79,0.15)] pt-3 pb-2">
            <div className="px-5 pb-2 text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-[rgba(96,108,58,0.65)]">Account</p>
              <p className="mt-2 text-sm font-semibold text-[rgb(52,63,29)] truncate">{session?.user?.name}</p>
            </div>
            <div className="mt-1 flex flex-col gap-1 px-2">
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-[rgb(72,84,42)] hover:bg-[#f5f1df] transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-white bg-[rgb(136,153,79)] hover:bg-[rgb(118,132,68)] transition-colors disabled:opacity-70 cursor-pointer"
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
          className="flex w-full items-center gap-3 rounded-2xl bg-[#fbf5e6] px-4 py-3 text-left transition-colors hover:bg-[#f5f0de] cursor-pointer"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(136,153,79)] text-white font-semibold text-lg shadow-[0_12px_28px_rgba(52,63,29,0.25)]">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[rgb(52,63,29)] truncate">{session?.user?.name}</p>
            <p className="text-xs text-[rgba(96,108,58,0.65)]">Workspace</p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[rgba(96,108,58,0.75)] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </aside>
  );
}
