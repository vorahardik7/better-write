'use client';

import { signOut, useSession } from '@/lib/auth-client';
import {
  FileText,
  Settings,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Activity,
  LogOut,
} from 'lucide-react';

interface NavigationItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

interface Document {
  id: string;
  title: string;
  lastModified: string;
  wordCount: number;
  preview: string;
  tags: string[];
  status: 'draft' | 'review' | 'published' | 'completed';
  starred?: boolean;
}

interface SidebarProps {
  documents: Document[];
  stats: StatItem[];
  navigationItems: NavigationItem[];
}

export function Sidebar({ documents, stats, navigationItems }: SidebarProps) {
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

        {/* Enhanced Stats Section */}
        <StatsSection stats={stats} />
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

        {/* Recent Activity */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <Activity className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-900">Recent Activity</h4>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3">
              {documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center group-hover:from-slate-200 group-hover:to-slate-300 transition-colors">
                    <FileText className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{doc.title}</div>
                    <div className="text-xs text-slate-500">{doc.lastModified}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

interface StatItem {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StatsSectionProps {
  stats: StatItem[];
}

function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-slate-500" />
        <h4 className="text-sm font-semibold text-slate-900">Progress</h4>
      </div>

      <div className="space-y-2">
        {stats.map((stat: StatItem) => {
          const Icon = stat.icon;
          const streakValue = parseInt(stat.value);

          return (
            <div key={stat.label} className="group">
              {/* Writing Streak Card */}
              {stat.label === 'Writing Streak' && (
                <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-lg p-3 border border-slate-200/50 hover:border-slate-300/50 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-slate-200 transition-colors">
                        <Icon className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                      <div className="text-sm font-medium text-slate-900">
                        {stat.label}
                      </div>
                    </div>
          
                  </div>

                  {/* Streak Display */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            i < streakValue
                              ? 'bg-slate-600 shadow-sm scale-110'
                              : 'bg-slate-200 hover:bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {streakValue} day{streakValue !== 1 ? 's' : ''}
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
