'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, Clock, Archive, Star, Share2 } from 'lucide-react';
import { Sidebar } from './sidebar';
import { MainContent } from './main-content';


export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('all-docs');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    starredOnly: false,
    sharedOnly: false,
  });
  const [documentCounts, setDocumentCounts] = useState({
    all: 0,
    starred: 0,
    recent: 0,
    shared: 0,
    archive: 0,
  });

  const navigationItems = [
    { id: 'all-docs', label: 'All Documents', icon: BookOpen },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'shared', label: 'Shared with me', icon: Share2 },
    { id: 'archive', label: 'Archive', icon: Archive },
  ];

  const handleSelectNavigation = (itemId: string) => {
    setActiveItem(itemId);

    setFilters((prev) => ({
      ...prev,
      starredOnly: itemId === 'starred',
      sharedOnly: itemId === 'shared',
    }));

    if (itemId === 'archive') {
      setViewMode('list');
    }
  };

  useEffect(() => {
    if (isPending) return;
    if (!session) router.push('/');
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f4f0]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-600"></div>
          <p className="text-slate-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-screen bg-[#f5f4f0] flex overflow-hidden">
      <Sidebar
        navigationItems={navigationItems}
        activeItem={activeItem}
        onSelect={handleSelectNavigation}
        documentCounts={documentCounts}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MainContent
          activeItem={activeItem}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          filters={filters}
          onDocumentCountsChange={setDocumentCounts}
        />
      </div>
    </div>
  );
}
