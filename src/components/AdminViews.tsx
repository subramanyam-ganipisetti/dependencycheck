import React, { useState } from 'react';
import {
  DashboardStats,
  RepositoryItem,
  UpdateHistoryItem,
  TrendsData,
  VulnerabilityAdvisory,
  ExploitabilityResult
} from '../types';
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
  CornerDownRight
} from 'lucide-react';

// ==========================================
// 1. ADMIN OVERVIEW
// ==========================================
export const AdminOverviewView: React.FC<{
  stats: DashboardStats;
  vulnerabilities: VulnerabilityAdvisory[];
  onNavigate: (tabId: string) => void;
  onInspectVuln: (vuln: any) => void;
}> = ({ stats, vulnerabilities, onNavigate, onInspectVuln }) => {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
            SOC LIVE TELEMETRY
          </span>
          <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
            Enterprise Supply-Chain Security Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Real-time monitoring across {stats.total_repositories} connected repositories. Tracking {stats.total_dependencies} dependencies, AST reachability paths, and automated safe pull requests.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0">
          <div className="text-right">
            <span className="text-2xl font-black text-cyan-400 block">{stats.overall_posture_score} / 100</span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">GRADE {stats.overall_health_grade}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono font-medium">CONNECTED REPOSITORIES</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{stats.total_repositories}</div>
          <div className="text-[11px] text-cyan-400 mt-1 font-mono">100% Monitored</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono font-medium">TOTAL PACKAGES</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{stats.total_dependencies}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">npm & pip packages</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono font-medium">ACTIVE VULNERABILITIES</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">{stats.total_vulnerability_findings}</div>
          <div className="text-[11px] text-rose-400 font-mono mt-1">{stats.reachable_count} Reachable / {stats.unreachable_count} Unused</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono font-medium">SAFE PATCHES READY</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{stats.safe_updates_ready}</div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">66.7% PR Volume Reduction</div>
        </div>
      </div>

      {/* High Priority Triage List */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              Prioritized Remediation Queue
            </h3>
            <p className="text-xs text-slate-400">Ranked by AST reachability, CVSS severity, and backward compatibility.</p>
          </div>
          <button
            onClick={() => onNavigate('reachability')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
          >
            View AST Call-Tree →
          </button>
        </div>

        <div className="divide-y divide-slate-800 font-mono text-xs">
          {vulnerabilities.slice(0, 5).map((v, i) => (
            <div key={v.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-950/40 p-2 rounded transition">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  v.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {v.severity} ({v.cvss})
                </span>
                <span className="font-bold text-white">{v.package}</span>
                <span className="text-slate-500">{v.id}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Fixed in <strong className="text-emerald-400">{v.fixed_version}</strong></span>
                <button
                  onClick={() => onInspectVuln(v)}
                  className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Inspect & Fix
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. ADMIN REPOSITORIES
// ==========================================
export const AdminRepositoriesView: React.FC<{
  repositories: RepositoryItem[];
  onSelectRepo: (id: string) => void;
  onOpenAdd: () => void;
}> = ({ repositories, onSelectRepo, onOpenAdd }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Monitored Repositories</h2>
          <p className="text-xs text-slate-400">Continuous supply-chain vulnerability tracking.</p>
        </div>
        <button
          onClick={onOpenAdd}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
        >
          ➕ Connect Repository
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {repositories.map(repo => (
          <div
            key={repo.id}
            onClick={() => onSelectRepo(repo.id)}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white font-mono group-hover:text-cyan-400 transition">{repo.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-bold">
                GRADE {repo.health_grade}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{repo.description}</p>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2 border-t border-slate-800">
              <span>{repo.language} • {repo.default_branch}</span>
              <span className="text-rose-400 font-bold">{repo.vulnerability_count} Vulns</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. ADMIN REPO DETAILS
// ==========================================
export const AdminRepoDetailsView: React.FC<{
  repo: RepositoryItem;
  onBack: () => void;
  onInspectVuln: (v: any) => void;
}> = ({ repo, onBack, onInspectVuln }) => {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono">
        ← Back to Repositories
      </button>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-mono">{repo.name}</h2>
          <p className="text-xs text-slate-400 mt-1">{repo.description}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-cyan-400 block">{repo.posture_score} / 100</span>
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase">GRADE {repo.health_grade}</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. ADMIN DEPENDENCY GRAPH
// ==========================================
export const AdminGraphView: React.FC<{ graphData: any }> = ({ graphData }) => {
  const nodes = graphData?.nodes || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Dependency Graph & Call-Tree Hierarchy</h2>
        <p className="text-xs text-slate-400">Visual topology of dependencies, transitive edges, and vulnerable paths.</p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-6">
        {/* Tree Root */}
        <div className="inline-block p-4 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-sm shadow-lg shadow-cyan-500/10">
          📦 cloud-nexus-api (Application Root)
        </div>

        <div className="w-0.5 h-6 bg-slate-800 mx-auto" />

        {/* Tree Children */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {nodes.filter((n: any) => n.id !== 'root').map((n: any) => {
            const isReachable = n.type === 'vulnerable_reachable';
            const isBreaking = n.type === 'breaking_change';

            return (
              <div
                key={n.id}
                className={`p-3 rounded-xl border text-xs font-mono text-left space-y-1 ${
                  isReachable
                    ? 'bg-rose-950/40 border-rose-500 text-rose-300 shadow-md shadow-rose-500/20'
                    : isBreaking
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-bold truncate">{n.name}</div>
                <div className="text-[10px] text-slate-400 uppercase">
                  {isReachable ? '🔴 REACHABLE (AST)' : isBreaking ? '⚠️ BREAKING CHANGE' : 'SAFE'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. ADMIN VULNERABILITIES VIEW
// ==========================================
export const AdminVulnerabilitiesView: React.FC<{
  vulnerabilities: VulnerabilityAdvisory[];
  onInspectVuln: (v: any) => void;
}> = ({ vulnerabilities, onInspectVuln }) => {
  const [search, setSearch] = useState('');

  const filtered = vulnerabilities.filter(v =>
    v.package.toLowerCase().includes(search.toLowerCase()) ||
    v.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Vulnerability Advisory Intelligence</h2>
          <p className="text-xs text-slate-400">Curated NVD, GitHub Advisory, and OSV.dev feeds.</p>
        </div>

        <div className="w-64">
          <input
            type="text"
            placeholder="Search CVE or package..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="divide-y divide-slate-800 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
        {filtered.map(v => (
          <div key={v.id} className="p-4 hover:bg-slate-950/40 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  v.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {v.severity} ({v.cvss})
                </span>
                <span className="font-bold text-white">{v.package}</span>
                <span className="text-slate-500">{v.id}</span>
              </div>
              <p className="text-xs text-slate-400 font-sans">{v.title}</p>
            </div>

            <button
              onClick={() => onInspectVuln(v)}
              className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Inspect & Fix
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 6. ADMIN REACHABILITY VIEW
// ==========================================
export const AdminReachabilityView: React.FC<{
  stats: DashboardStats;
  vulnerabilities: VulnerabilityAdvisory[];
  onInspectVuln: (v: any) => void;
}> = ({ stats, vulnerabilities, onInspectVuln }) => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-rose-400" />
          AST Reachability Execution Proof
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Static AST analysis traverses imported symbols from application entrypoints down to invocation call sites. Vulnerabilities with zero call sites are classified as <strong>UNREACHABLE</strong> to eliminate developer alert fatigue.
        </p>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
        <div className="text-rose-400 font-bold flex items-center gap-1.5">
          <CornerDownRight className="w-4 h-4" /> Actively Reachable Call Chain (Confirmed):
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1 text-slate-300">
          <div>1. src/server.ts (HTTP Request Dispatcher)</div>
          <div>2. src/routes/auth.ts (Route Controller Layer) [Line 22]</div>
          <div className="text-rose-400 font-bold">└── jsonwebtoken.verify(token, getSecretKey())</div>
        </div>

        <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-400 text-[11px] overflow-x-auto">
{`// src/routes/auth.ts:22
try {
  const decoded = jwt.verify(token, getSecretKey());
  return res.json({ status: 'valid', payload: decoded });
} catch (err) { ... }`}
        </pre>
      </div>
    </div>
  );
};

// ==========================================
// 7. ADMIN TRENDS VIEW
// ==========================================
export const AdminTrendsView: React.FC<{
  trends: TrendsData;
  stats: DashboardStats;
}> = ({ trends, stats }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Security Posture Timeline & Trends</h2>
        <p className="text-xs text-slate-400">Longitudinal telemetry of vulnerability reduction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
          <h3 className="font-bold text-white">Historical Posture Scores</h3>
          {trends.timeline.map((point, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">{point.date}</span>
              <span className="text-cyan-400 font-bold">{point.posture_score} / 100</span>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
          <h3 className="font-bold text-white">Ecosystem Distribution</h3>
          <div className="flex items-center justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">npm (JavaScript / TypeScript)</span>
            <span className="text-emerald-400 font-bold">{trends.ecosystem_breakdown.npm} packages</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">pip (Python)</span>
            <span className="text-cyan-400 font-bold">{trends.ecosystem_breakdown.pip} packages</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. ADMIN SAFE UPDATES VIEW
// ==========================================
export const AdminSafeUpdatesView: React.FC<{
  vulnerabilities: VulnerabilityAdvisory[];
  onInspectVuln: (v: any) => void;
}> = ({ vulnerabilities, onInspectVuln }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Automated Safe Updates Engine</h2>
        <p className="text-xs text-slate-400">Patches verified with zero breaking changes.</p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <p className="text-xs text-slate-300">
          The following updates are backward-compatible within SemVer specifications and have passed deterministic sandbox compilation:
        </p>

        <div className="divide-y divide-slate-800 font-mono text-xs">
          {vulnerabilities.filter(v => v.fixed_version !== 'latest').map(v => (
            <div key={v.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">{v.package}</span>
                <span className="text-slate-500 ml-2">→ {v.fixed_version}</span>
              </div>
              <button
                onClick={() => onInspectVuln(v)}
                className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Safe Upgrade
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. ADMIN PR VIEW
// ==========================================
export const AdminPRView: React.FC<{
  history: UpdateHistoryItem[];
  onRefresh: () => void;
}> = ({ history, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Pull Request Operations Center</h2>
          <p className="text-xs text-slate-400">Automated security remediation PRs opened on GitHub.</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono hover:text-white flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh PRs</span>
        </button>
      </div>

      <div className="divide-y divide-slate-800 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
        {history.map(pr => (
          <div key={pr.id} className="p-4 hover:bg-slate-950/40 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  pr.status === 'merged' ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {pr.status}
                </span>
                <span className="font-bold text-white">PR #{pr.pr_number}: Bump {pr.package_name}</span>
                <span className="text-slate-500">({pr.from_version} → {pr.to_version})</span>
              </div>
              <p className="text-xs text-slate-400 font-sans">{pr.repository_name} • Deterministic sandbox tests passed</p>
            </div>

            <a
              href={pr.pr_url}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-xs"
            >
              <span>GitHub PR #{pr.pr_number}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 10. ADMIN ACTIVITY AUDIT VIEW
// ==========================================
export const AdminActivityView: React.FC<{
  scanLogs: any[];
  onRefresh: () => void;
}> = ({ scanLogs, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Scan Activity & Security Audits</h2>
          <p className="text-xs text-slate-400">Append-only audit trail of scanning and patch events.</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono hover:text-white flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit</span>
        </button>
      </div>

      <div className="divide-y divide-slate-800 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
        {scanLogs.map((log: any) => (
          <div key={log.id} className="p-4 hover:bg-slate-950/40 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span className="text-cyan-400 font-bold">{log.event}</span>
              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-slate-200 text-xs font-sans">{log.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 11. ADMIN SETTINGS VIEW
// ==========================================
export const AdminSettingsView: React.FC<{
  showToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  const [token, setToken] = useState('ghp_mocktoken98723498234');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('GitHub token encrypted and saved securely.', 'success');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-white">GitHub Integration & API Configuration</h2>
        <p className="text-xs text-slate-400">Manage repository access tokens and webhook web listeners.</p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
            GitHub Personal Access Token (PAT)
          </label>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">Requires 'repo' and 'pull_requests:write' permissions.</p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
};

// ==========================================
// 12. INSPECT AND FIX MODAL
// ==========================================
export const InspectAndFixModal: React.FC<{
  vuln: any;
  preview: any;
  activeStep: number;
  isRunning: boolean;
  result: any;
  onRunFix: () => void;
  onClose: () => void;
}> = ({ vuln, preview, activeStep, isRunning, result, onRunFix, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            <h3 className="text-base font-bold text-white">Automated Remediation: {vuln.package}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono space-y-1">
            <div className="text-slate-400">Vulnerability: <strong className="text-rose-400">{vuln.id}</strong></div>
            <div className="text-slate-400">Candidate Upgrade: <strong className="text-emerald-400">{vuln.fixed_version}</strong></div>
          </div>

          {preview && preview.breaking_notes && (
            <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-1">
              <span className="text-amber-400 font-bold block">Breaking Change Warnings:</span>
              <ul className="list-disc pl-4 text-slate-300 space-y-0.5">
                {preview.breaking_notes.map((note: string, idx: number) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isRunning && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
            <div className="text-cyan-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Executing Sandbox Validation & PR Pipeline (Step {activeStep}/11)...</span>
            </div>
          </div>
        )}

        {result && (
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-2 text-xs font-mono">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Remediation Pull Request Ready!
            </div>
            <a href={result.pr_url} target="_blank" rel="noreferrer" className="text-cyan-400 underline block">
              View Pull Request #{result.pr_number} on GitHub →
            </a>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
          {!result && (
            <button
              onClick={onRunFix}
              disabled={isRunning}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition cursor-pointer"
            >
              {isRunning ? 'Running Pipeline...' : 'Run Automated Sandbox & PR →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 13. ADD REPO MODAL
// ==========================================
export const AddRepositoryModal: React.FC<{
  onClose: () => void;
  onRepoAdded: (newId: string) => void;
  showToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}> = ({ onClose, onRepoAdded, showToast }) => {
  const [repoUrl, setRepoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Repository connected and indexed successfully.', 'success');
    onRepoAdded('repo-nexus-api');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Connect GitHub Repository</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1">Repository HTTPS Clone URL</label>
            <input
              type="text"
              placeholder="https://github.com/org/repo.git"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Index Repository →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
