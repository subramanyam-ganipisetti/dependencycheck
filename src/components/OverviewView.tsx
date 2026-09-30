import React from 'react';
import { ScanResult, TabKey } from '../types';
import {
  ShieldAlert,
  GitFork,
  TrendingDown,
  Terminal,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  GitPullRequest,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';

interface OverviewViewProps {
  scanResult: ScanResult;
  onNavigateTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  scanResult,
  onNavigateTab
}) => {
  const { metrics, triageEvaluations, patchGroups, dependencies } = scanResult;

  return (
    <div className="space-y-6">
      {/* Executive Supply Chain Health Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 rounded-xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              Analysis Complete • {scanResult.projectName}
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Software Supply-Chain Triage & Patch Optimization
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Analyzed {dependencies.length} packages ({scanResult.directDependenciesCount} direct, {scanResult.transitiveDependenciesCount} transitive).
              Identified <strong className="text-rose-400 font-bold">{metrics.reachableCount} active reachable vulnerability</strong>, filtered out false alarms via AST call-tree tracing, and consolidated safe upgrades into grouped PRs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab('exploitability')}
              className="px-3.5 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Inspect Call-Tree</span>
            </button>

            <button
              onClick={() => onNavigateTab('patch-groups')}
              className="px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>View Grouped Patches</span>
            </button>
          </div>
        </div>
      </div>

      {/* Priority Triage Queue Table */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              Intelligent Patch Priority Queue
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by composite risk score (Severity × Reachability × Exposure × Confidence).
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {triageEvaluations.length} Evaluated Findings
          </span>
        </div>

        <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Package / CVE</th>
                <th className="p-3">CVSS / Severity</th>
                <th className="p-3">AST Reachability</th>
                <th className="p-3">Breaking Risk</th>
                <th className="p-3">Composite Risk Score</th>
                <th className="p-3">Triage Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {triageEvaluations.map((t, idx) => {
                const isReachable = t.reachability === 'REACHABLE';
                const isCriticalScore = t.compositeRiskScore >= 70;

                return (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="p-3 font-semibold text-white">
                      <div>{t.packageName}</div>
                      <span className="text-[10px] text-slate-500">{t.vulnerabilityId}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          t.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300'
                            : t.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {t.severity} ({t.cvss})
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          isReachable
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {t.reachability}
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          t.breakingRisk === 'HIGH RISK'
                            ? 'text-rose-400'
                            : t.breakingRisk === 'SAFE'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {t.breakingRisk}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCriticalScore ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${t.compositeRiskScore}%` }}
                          />
                        </div>
                        <span className={`font-bold ${isCriticalScore ? 'text-rose-400' : 'text-slate-300'}`}>
                          {t.compositeRiskScore}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-sans">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          t.recommendedAction === 'PATCH NOW'
                            ? 'bg-rose-500 text-slate-950'
                            : t.recommendedAction === 'PATCH SAFELY'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : t.recommendedAction === 'DEFER — NOT REACHABLE'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {t.recommendedAction}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Interactive Feature Entry Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('exploitability')}
          className="bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-105 transition">
              <GitFork className="w-4 h-4" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
          </div>
          <h4 className="text-sm font-bold text-white">AST Call-Tree Engine</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect the exact code path from HTTP entrypoints to vulnerable dependency functions.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('patch-groups')}
          className="bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition">
              <TrendingDown className="w-4 h-4" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition" />
          </div>
          <h4 className="text-sm font-bold text-white">60%+ PR Reduction</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Consolidates verified non-breaking patches into unified bundles to eliminate developer review fatigue.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('sandbox')}
          className="bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition">
              <Terminal className="w-4 h-4" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition" />
          </div>
          <h4 className="text-sm font-bold text-white">Deterministic Sandbox</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Runs <code className="text-amber-300 font-mono">npm ci</code> and test suites in ephemeral containers with SHA-256 hash checks.
          </p>
        </div>
      </div>
    </div>
  );
};
