import React from 'react';
import {
  Activity,
  GitFork,
  ShieldCheck,
  AlertTriangle,
  FolderGit2,
  GitPullRequest,
  Terminal,
  UploadCloud,
  FileCode2,
  Lock
} from 'lucide-react';

export type TabKey =
  | 'overview'
  | 'exploitability'
  | 'vulnerabilities'
  | 'breaking'
  | 'patch-groups'
  | 'pr-generator'
  | 'sandbox'
  | 'custom-scan'
  | 'architecture';

interface NavigationTabsProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  vulnerabilityCount: number;
  reachableCount: number;
  breakingCount: number;
  patchGroupCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  vulnerabilityCount,
  reachableCount,
  breakingCount,
  patchGroupCount
}) => {
  const tabs = [
    {
      key: 'overview' as TabKey,
      label: 'Overview',
      icon: Activity,
      badge: null
    },
    {
      key: 'exploitability' as TabKey,
      label: 'Exploitability (AST)',
      icon: GitFork,
      badge: `${reachableCount} Reachable`,
      highlight: true
    },
    {
      key: 'vulnerabilities' as TabKey,
      label: 'CVE Intelligence',
      icon: ShieldCheck,
      badge: vulnerabilityCount
    },
    {
      key: 'breaking' as TabKey,
      label: 'Breaking Changes',
      icon: AlertTriangle,
      badge: breakingCount > 0 ? `${breakingCount} Risk` : null
    },
    {
      key: 'patch-groups' as TabKey,
      label: 'Patch Groups (60% PR ↓)',
      icon: FolderGit2,
      badge: `${patchGroupCount} Groups`
    },
    {
      key: 'pr-generator' as TabKey,
      label: 'PR Generator',
      icon: GitPullRequest,
      badge: 'Ready'
    },
    {
      key: 'sandbox' as TabKey,
      label: 'Sandbox Validation',
      icon: Terminal,
      badge: 'npm ci'
    },
    {
      key: 'custom-scan' as TabKey,
      label: 'Custom Scan',
      icon: UploadCloud,
      badge: null
    },
    {
      key: 'architecture' as TabKey,
      label: 'Security & RFC',
      icon: Lock,
      badge: null
    }
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-900/60 sticky top-16 z-40 backdrop-blur-md overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 py-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? (tab.highlight ? 'text-rose-400' : 'text-emerald-400') : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
