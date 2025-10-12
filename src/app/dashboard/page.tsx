'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BookOpen, Clock, Archive } from 'lucide-react';
import { Sidebar } from './sidebar';
import { MainContent } from './main-content';


export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const navigationItems = [
    { label: 'All Documents', icon: BookOpen, active: true },
    { label: 'Starred', icon: BookOpen, active: false },
    { label: 'Recent', icon: Clock, active: false },
    { label: 'Archive', icon: Archive, active: false },
  ];

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
      <Sidebar navigationItems={navigationItems} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MainContent />
      </div>
    </div>
  );
}
