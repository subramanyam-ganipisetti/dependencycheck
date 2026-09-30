import React, { useState, useEffect } from 'react';
import {
  ScanResult,
  PublicScanReport,
  PatchGroup,
  SandboxValidationReport,
  FileInputItem,
  DashboardStats,
  RepositoryItem,
  UpdateHistoryItem,
  TrendsData,
  VulnerabilityAdvisory
} from './types';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { NavigationTabs, TabKey } from './components/NavigationTabs';
import { OverviewView } from './components/OverviewView';
import { ExploitabilityVisualizer } from './components/ExploitabilityVisualizer';
import { VulnerabilitiesView } from './components/VulnerabilitiesView';
import { BreakingChangesView } from './components/BreakingChangesView';
import { PatchGroupsView } from './components/PatchGroupsView';
import { PRArtifactView } from './components/PRArtifactView';
import { SandboxValidationView } from './components/SandboxValidationView';
import { CustomScannerView } from './components/CustomScannerView';
import { ArchitectureView } from './components/ArchitectureView';
import { PublicPortal } from './components/PublicPortal';
import { VisualCallGraph } from './components/VisualCallGraph';
import { LockfileDiffViewer } from './components/LockfileDiffViewer';
import { CiCdPolicySimulator } from './components/CiCdPolicySimulator';
import {
  AdminOverviewView,
  AdminRepositoriesView,
  AdminRepoDetailsView,
  AdminGraphView,
  AdminVulnerabilitiesView,
  AdminReachabilityView,
  AdminTrendsView,
  AdminSafeUpdatesView,
  AdminPRView,
  AdminActivityView,
  AdminSettingsView,
  InspectAndFixModal,
  AddRepositoryModal
} from './components/AdminViews';
import {
  DEMO_PACKAGE_JSON,
  DEMO_PACKAGE_LOCK_JSON,
  DEMO_SOURCE_FILES
} from './demo/demoRepository';
import { executeDependencyCheckScan } from './analyzer/orchestrator';
import { buildPublicScanReport } from './analyzer/publicReportGenerator';
import { runDeterministicSandboxValidation } from './analyzer/sandboxEngine';
import {
  Shield,
  Layers,
  Terminal,
  Cpu,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  GitBranch,
  Copy,
  Check,
  Play,
  FileCode,
  Zap,
  Globe,
  Sliders,
  Split,
  FileText
} from 'lucide-react';

export default function App() {
  // Experience Mode: 'public' or 'admin'
  const [userMode, setUserMode] = useState<'public' | 'admin'>('public');

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('depcheck_is_admin') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Public Scan State
  const [publicScanStatus, setPublicScanStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [publicScanProgress, setPublicScanProgress] = useState(0);
  const [publicScanStep, setPublicScanStep] = useState(0);
  const [publicReport, setPublicReport] = useState<PublicScanReport | null>(null);
  const [publicErrorMessage, setPublicErrorMessage] = useState<string | null>(null);

  // Admin SOC State
  const [adminActiveTab, setAdminActiveTab] = useState<string>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityAdvisory[]>([]);
  const [updateHistory, setUpdateHistory] = useState<UpdateHistoryItem[]>([]);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [scanLogs, setScanLogs] = useState<any[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryItem | null>(null);

  // Classic / Deep Dive Tab in Admin
  const [classicScanResult, setClassicScanResult] = useState<ScanResult | null>(null);
  const [classicTab, setClassicTab] = useState<TabKey>('overview');
  const [enableLiveOSV, setEnableLiveOSV] = useState(false);

  // Modals
  const [inspectVuln, setInspectVuln] = useState<any>(null);
  const [activeFixStep, setActiveFixStep] = useState(1);
  const [isFixRunning, setIsFixRunning] = useState(false);
  const [fixResult, setFixResult] = useState<any>(null);
  const [fixPreviewData, setFixPreviewData] = useState<any>(null);
  const [isAddRepoOpen, setIsAddRepoOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Admin Data
  const refreshAdminData = async () => {
    try {
      const [sRes, rRes, vRes, uRes, tRes, gRes, lRes] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()).catch(() => null),
        fetch('/api/repositories').then(r => r.json()).catch(() => []),
        fetch('/api/vulnerabilities').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/updates/history').then(r => r.json()).catch(() => []),
        fetch('/api/dashboard/trends').then(r => r.json()).catch(() => null),
        fetch('/api/dashboard/graph').then(r => r.json()).catch(() => null),
        fetch('/api/repositories/activity/audit').then(r => r.json()).catch(() => [])
      ]);

      if (sRes) setStats(sRes);
      setRepositories(rRes || []);
      setVulnerabilities(vRes?.data || []);
      setUpdateHistory(uRes || []);
      if (tRes) setTrends(tRes);
      if (gRes) setGraphData(gRes);
      setScanLogs(lRes || []);
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    }
  };

  // Initial load
  useEffect(() => {
    refreshAdminData();
    // Also prepare classic scan result for the deep-dive analyzer
    executeDependencyCheckScan({
      projectName: 'cloud-nexus-api (Demo Repo)',
      packageJson: DEMO_PACKAGE_JSON,
      lockfile: DEMO_PACKAGE_LOCK_JSON,
      sourceFiles: DEMO_SOURCE_FILES,
      enableLiveOSV: false
    }).then(res => {
      setClassicScanResult(res);
    });
  }, []);

  useEffect(() => {
    if (userMode === 'admin') {
      refreshAdminData();
    }
  }, [userMode]);

  useEffect(() => {
    if (selectedRepoId && repositories.length > 0) {
      const found = repositories.find(r => r.id === selectedRepoId) || repositories[0];
      setSelectedRepo(found);
    }
  }, [selectedRepoId, repositories]);

  // Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin' || adminPassword === 'secret' || adminPassword === '') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('depcheck_is_admin', 'true');
      setUserMode('admin');
      setIsAdminLoginOpen(false);
      setAdminPassword('');
      setAdminLoginError('');
      showToast('Welcome, Administrator. Security Command Center active.', 'success');
    } else {
      setAdminLoginError('Invalid administrator credentials.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('depcheck_is_admin');
    setUserMode('public');
    showToast('Logged out of Admin SOC. Public Portal active.', 'info');
  };

  // Public ZIP Scan
  const handlePublicScanZip = async (file: File) => {
    setPublicScanStatus('processing');
    setPublicErrorMessage(null);
    setPublicScanProgress(10);
    setPublicScanStep(1);

    const formData = new FormData();
    formData.append('file', file);

    const interval = setInterval(() => {
      setPublicScanProgress(prev => (prev >= 85 ? prev : prev + 12));
      setPublicScanStep(prev => (prev < 9 ? prev + 1 : prev));
    }, 320);

    try {
      const res = await fetch('/api/public/scan-zip', {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Scan failed');
      }

      const reportData: PublicScanReport = await res.json();
      setPublicScanProgress(100);
      setPublicScanStep(11);
      setPublicReport(reportData);
      setPublicScanStatus('completed');
      showToast('Project security analysis complete!', 'success');
    } catch (err: any) {
      clearInterval(interval);
      setPublicScanStatus('error');
      setPublicErrorMessage(err.message || 'Scan execution failed');
      showToast(`Scan error: ${err.message}`, 'error');
    }
  };

  // Public Sample Scan
  const handlePublicSampleScan = async (type: 'python' | 'node') => {
    setPublicScanStatus('processing');
    setPublicErrorMessage(null);
    setPublicScanProgress(15);
    setPublicScanStep(2);

    const interval = setInterval(() => {
      setPublicScanProgress(prev => (prev >= 85 ? prev : prev + 14));
      setPublicScanStep(prev => (prev < 9 ? prev + 1 : prev));
    }, 280);

    try {
      const res = await fetch(`/api/public/sample-demo-scan?project_type=${type}`, {
        method: 'POST'
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Sample scan failed');
      }

      const reportData: PublicScanReport = await res.json();
      setPublicScanProgress(100);
      setPublicScanStep(11);
      setPublicReport(reportData);
      setPublicScanStatus('completed');
      showToast('Sample project analyzed successfully!', 'success');
    } catch (err: any) {
      clearInterval(interval);
      setPublicScanStatus('error');
      setPublicErrorMessage(err.message || 'Sample scan failed');
    }
  };

  // Automated Remediation
  const handleInspectAndFix = async (vulnItem: any) => {
    setInspectVuln(vulnItem);
    setActiveFixStep(1);
    setIsFixRunning(false);
    setFixResult(null);

    try {
      const res = await fetch('/api/updates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_name: vulnItem.package,
          target_version: vulnItem.fixed_version
        })
      });
      if (res.ok) {
        const prevData = await res.json();
        setFixPreviewData(prevData);
      }
    } catch (e) {}
  };

  const handleRunAutomatedFix = async () => {
    if (!inspectVuln) return;
    setIsFixRunning(true);
    setFixResult(null);

    for (let i = 1; i <= 6; i++) {
      setActiveFixStep(i);
      await new Promise(r => setTimeout(r, 220));
    }

    try {
      setActiveFixStep(7);
      const res = await fetch('/api/updates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_name: inspectVuln.package,
          target_version: inspectVuln.fixed_version
        })
      });

      for (let i = 8; i <= 11; i++) {
        setActiveFixStep(i);
        await new Promise(r => setTimeout(r, 200));
      }

      const resultData = await res.json();
      setFixResult(resultData);
      await refreshAdminData();
      showToast(`Pull Request #${resultData.pr_number} opened on GitHub!`, 'success');
    } catch (err: any) {
      showToast(`Remediation error: ${err.message}`, 'error');
    } finally {
      setIsFixRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border text-xs font-medium transition-all ${
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-500 text-rose-200' :
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200' :
          'bg-slate-900 border-cyan-500/50 text-cyan-200'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. PUBLIC EXPERIENCE                                     */}
      {/* ======================================================== */}
      {userMode === 'public' && (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                setPublicScanStatus('idle');
                setPublicReport(null);
              }}
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg shadow-sm">
                🛡️
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                  DependencyCheck
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold">
                    PUBLIC SCANNER
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">AI-Powered Dependency Security</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (isAdminAuthenticated) {
                    setUserMode('admin');
                  } else {
                    setIsAdminLoginOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin SOC Login</span>
              </button>
            </div>
          </header>

          <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-10">
            <PublicPortal
              onScanZip={handlePublicScanZip}
              onSampleScan={handlePublicSampleScan}
              scanStatus={publicScanStatus}
              scanProgress={publicScanProgress}
              scanStep={publicScanStep}
              report={publicReport}
              errorMessage={publicErrorMessage}
              onReset={() => {
                setPublicScanStatus('idle');
                setPublicReport(null);
              }}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            />
          </main>

          <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500 font-mono">
            DependencyCheck • AI-Powered Dependency Security Command Center • Safe Update Engine
          </footer>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ADMINISTRATOR SOC COMMAND CENTER                      */}
      {/* ======================================================== */}
      {userMode === 'admin' && (
        <div className="min-h-screen flex flex-col">
          {/* Top Admin Bar */}
          <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg shadow-sm">
                🛡️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base tracking-tight text-white">DependencyCheck</h1>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold">
                    ADMIN SOC
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Security Command Center & Automated Patch Manager</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Exit to Public Portal</span>
              </button>
              <button
                onClick={() => setIsAddRepoOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer"
              >
                <span>➕ Connect Repo</span>
              </button>
            </div>
          </header>

          {/* Admin Sidebar + Views */}
          <div className="flex-1 flex overflow-hidden">
            <aside className="w-60 border-r border-slate-800 bg-slate-950 p-3 flex flex-col justify-between shrink-0">
              <div className="space-y-3">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  SOC Navigation
                </div>
                <nav className="space-y-1">
                  {[
                    { id: 'overview', label: 'Security Overview', icon: Shield },
                    { id: 'visual-callgraph', label: 'Interactive Call-Graph', icon: Cpu, badge: 'FEATURE' },
                    { id: 'diff-viewer', label: 'Lockfile Diff Viewer', icon: Split, badge: 'FEATURE' },
                    { id: 'cicd-policy', label: 'CI/CD Policy Gate', icon: Sliders, badge: 'FEATURE' },
                    { id: 'repositories', label: 'Repositories', icon: GitBranch, count: repositories.length },
                    { id: 'graph', label: 'Dependency Graph', icon: Layers },
                    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle, count: stats?.total_vulnerability_findings },
                    { id: 'reachability', label: 'AST Reachability', icon: Cpu, badge: 'AI-AST' },
                    { id: 'trends', label: 'Security Trends', icon: TrendingDown },
                    { id: 'updates', label: 'Safe Updates', icon: Zap },
                    { id: 'prs', label: 'Pull Request Center', icon: GitPullRequest, count: updateHistory.length },
                    { id: 'activity', label: 'Scan Activity', icon: Terminal },
                    { id: 'classic-analyzer', label: 'Deep Pipeline Inspector', icon: FileCode },
                    { id: 'settings', label: 'GitHub Settings', icon: Lock }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = adminActiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setAdminActiveTab(tab.id);
                          if (tab.id === 'repositories') setSelectedRepoId(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                          isActive
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </div>
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono bg-slate-800 text-slate-300">
                            {tab.count}
                          </span>
                        )}
                        {tab.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-rose-500/20 text-rose-300">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="text-cyan-400 font-bold text-xs">Admin SOC Active</div>
                <p className="text-[10px]">Access to full AST call traces, patch grouping, and automated GitHub PR branches.</p>
              </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
              {adminActiveTab === 'overview' && stats && (
                <AdminOverviewView
                  stats={stats}
                  vulnerabilities={vulnerabilities}
                  onNavigate={setAdminActiveTab}
                  onInspectVuln={handleInspectAndFix}
                />
              )}

              {adminActiveTab === 'visual-callgraph' && (
                <VisualCallGraph />
              )}

              {adminActiveTab === 'diff-viewer' && (
                <LockfileDiffViewer />
              )}

              {adminActiveTab === 'cicd-policy' && (
                <CiCdPolicySimulator />
              )}

              {adminActiveTab === 'repositories' && (
                <AdminRepositoriesView
                  repositories={repositories}
                  onSelectRepo={(id) => {
                    setSelectedRepoId(id);
                    setAdminActiveTab('repo_details');
                  }}
                  onOpenAdd={() => setIsAddRepoOpen(true)}
                />
              )}

              {adminActiveTab === 'repo_details' && selectedRepo && (
                <AdminRepoDetailsView
                  repo={selectedRepo}
                  onBack={() => setAdminActiveTab('repositories')}
                  onInspectVuln={handleInspectAndFix}
                />
              )}

              {adminActiveTab === 'graph' && graphData && (
                <AdminGraphView graphData={graphData} />
              )}

              {adminActiveTab === 'vulnerabilities' && (
                <AdminVulnerabilitiesView
                  vulnerabilities={vulnerabilities}
                  onInspectVuln={handleInspectAndFix}
                />
              )}

              {adminActiveTab === 'reachability' && stats && (
                <AdminReachabilityView
                  stats={stats}
                  vulnerabilities={vulnerabilities}
                  onInspectVuln={handleInspectAndFix}
                />
              )}

              {adminActiveTab === 'trends' && trends && stats && (
                <AdminTrendsView trends={trends} stats={stats} />
              )}

              {adminActiveTab === 'updates' && (
                <AdminSafeUpdatesView
                  vulnerabilities={vulnerabilities}
                  onInspectVuln={handleInspectAndFix}
                />
              )}

              {adminActiveTab === 'prs' && (
                <AdminPRView history={updateHistory} onRefresh={refreshAdminData} />
              )}

              {adminActiveTab === 'activity' && (
                <AdminActivityView scanLogs={scanLogs} onRefresh={refreshAdminData} />
              )}

              {adminActiveTab === 'settings' && (
                <AdminSettingsView showToast={showToast} />
              )}

              {/* Deep Pipeline Inspector (The 10-Tab Hackathon Pipeline) */}
              {adminActiveTab === 'classic-analyzer' && classicScanResult && (
                <div className="space-y-6">
                  <MetricsBar
                    metrics={classicScanResult.metrics}
                    projectName={classicScanResult.projectName}
                  />

                  <NavigationTabs
                    activeTab={classicTab}
                    onSelectTab={setClassicTab}
                    vulnerabilityCount={classicScanResult.vulnerabilitiesFound.length}
                    reachableCount={classicScanResult.metrics.reachableCount}
                    breakingCount={classicScanResult.metrics.breakingChangeRiskCount}
                    patchGroupCount={classicScanResult.patchGroups.length}
                  />

                  {classicTab === 'overview' && (
                    <OverviewView
                      scanResult={classicScanResult}
                      onNavigateTab={setClassicTab}
                    />
                  )}

                  {classicTab === 'exploitability' && (
                    <ExploitabilityVisualizer
                      exploitabilities={classicScanResult.exploitabilityResults}
                      vulnerabilities={classicScanResult.vulnerabilitiesFound}
                      sourceFiles={DEMO_SOURCE_FILES}
                    />
                  )}

                  {classicTab === 'vulnerabilities' && (
                    <VulnerabilitiesView
                      vulnerabilities={classicScanResult.vulnerabilitiesFound}
                      exploitabilities={classicScanResult.exploitabilityResults}
                    />
                  )}

                  {classicTab === 'breaking' && (
                    <BreakingChangesView
                      breakingChanges={classicScanResult.breakingChanges}
                    />
                  )}

                  {classicTab === 'patch-groups' && (
                    <PatchGroupsView
                      patchGroups={classicScanResult.patchGroups}
                      originalPRCount={classicScanResult.metrics.originalPRVolume}
                      optimizedPRCount={classicScanResult.metrics.optimizedPRVolume}
                      reductionPercentage={classicScanResult.metrics.prReductionPercentage}
                      onSelectGroupForPR={() => setClassicTab('pr-generator')}
                      onTriggerValidation={(grp) => {
                        setClassicTab('sandbox');
                        return runDeterministicSandboxValidation(grp);
                      }}
                    />
                  )}

                  {classicTab === 'pr-generator' && (
                    <PRArtifactView
                      prArtifacts={classicScanResult.generatedPRs}
                      patchGroups={classicScanResult.patchGroups}
                    />
                  )}

                  {classicTab === 'sandbox' && (
                    <SandboxValidationView
                      initialReport={classicScanResult.validationReport}
                      patchGroups={classicScanResult.patchGroups}
                      onTriggerValidation={(grp) => runDeterministicSandboxValidation(grp)}
                    />
                  )}

                  {classicTab === 'custom-scan' && (
                    <CustomScannerView
                      onExecuteScan={async (params) => {
                        const newRes = await executeDependencyCheckScan(params);
                        setClassicScanResult(newRes);
                        setClassicTab('overview');
                      }}
                      isScanning={false}
                      enableLiveOSV={enableLiveOSV}
                    />
                  )}

                  {classicTab === 'architecture' && (
                    <ArchitectureView />
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔐</span>
                <h3 className="text-base font-bold text-white">Administrator Access</h3>
              </div>
              <button
                onClick={() => setIsAdminLoginOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Enter administrator credentials to unlock the full DevSecOps Security Command Center, AST reachability engine, and GitHub automated pull request generator.
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                  Passphrase / Security Key
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="Enter passphrase (or press Enter for demo mode)"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                  autoFocus
                />
                {adminLoginError && (
                  <p className="text-xs text-rose-400 mt-1 font-mono">{adminLoginError}</p>
                )}
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="text-cyan-400 font-bold">💡 Hackathon Demo Shortcut:</span>
                <p>Default credentials: leave blank or type <code className="text-white font-mono">admin</code>.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminLoginOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono cursor-pointer shadow-md"
                >
                  Unlock Command Center →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Repo Modal */}
      {isAddRepoOpen && (
        <AddRepositoryModal
          onClose={() => setIsAddRepoOpen(false)}
          onRepoAdded={async (newId) => {
            setIsAddRepoOpen(false);
            await refreshAdminData();
            setSelectedRepoId(newId);
            setAdminActiveTab('repo_details');
          }}
          showToast={showToast}
        />
      )}

      {/* Inspect and Fix Modal */}
      {inspectVuln && (
        <InspectAndFixModal
          vuln={inspectVuln}
          preview={fixPreviewData}
          activeStep={activeFixStep}
          isRunning={isFixRunning}
          result={fixResult}
          onRunFix={handleRunAutomatedFix}
          onClose={() => setInspectVuln(null)}
        />
      )}
    </div>
  );
}
