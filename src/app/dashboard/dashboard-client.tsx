'use client';

import { useState } from 'react';
import { BookOpen, Clock, Archive, Star, Share2 } from 'lucide-react';
import { Sidebar } from './sidebar';
import { MainContent } from './main-content';

interface DashboardClientProps {
  session: any; // You can type this properly based on your session type
}

export default function DashboardClient({ session }: DashboardClientProps) {
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

  return (
    <div className="h-screen bg-gradient-to-br from-[#fdf9f3] via-[#f8f4e6] to-[#f0ead9] flex overflow-hidden">
      {/* Unified Frame Design - Sidebar and Header as one continuous element */}
      <div className="flex flex-col w-80 h-full">
        {/* Sidebar with lighter theme */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#4a5a3a] via-[#5a6b47] to-[#6a7b57] rounded-r-3xl shadow-[0_8px_40px_rgba(90,107,71,0.2)]"></div>
          <div className="relative z-10 h-full">
            <Sidebar
              navigationItems={navigationItems}
              activeItem={activeItem}
              onSelect={handleSelectNavigation}
              documentCounts={documentCounts}
            />
          </div>
        </div>
      </div>

      {/* Main content area - completely open and spacious */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
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
    </div>
  );
}
