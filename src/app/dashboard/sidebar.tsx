'use client';

import { signOut, useSession } from '@/lib/auth-client';
import {
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface NavigationItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

interface SidebarProps {
  navigationItems: NavigationItem[];
}

export function Sidebar({ navigationItems }: SidebarProps) {
  const { data: session } = useSession();

  return (
    <aside className="w-80 bg-white border-r border-black/5 h-screen flex flex-col overflow-hidden">
      {/* User Profile Section */}
      <div className="p-6 border-b border-black/5 flex-shrink-0">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{session?.user?.name}</h3>
            <p className="text-sm text-slate-500">Premium Member</p>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <Settings className="w-4 h-4 text-slate-500" />
          </button>
        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 overflow-hidden">
        <div className="space-y-1 mb-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  item.active
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-black/5 flex-shrink-0">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            <HelpCircle className="w-4 h-4" />
            Help & Support
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          onClick={() => signOut()}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
