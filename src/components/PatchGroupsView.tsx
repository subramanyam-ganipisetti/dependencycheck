import React from 'react';
import { PatchGroup, PatchCandidate } from '../types';
import {
  FolderGit2,
  TrendingDown,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
  Play
} from 'lucide-react';

interface PatchGroupsViewProps {
  patchGroups: PatchGroup[];
  originalPRCount: number;
  optimizedPRCount: number;
  reductionPercentage: number;
  onSelectGroupForPR: (group: PatchGroup) => void;
  onTriggerValidation: (group: PatchGroup) => void;
}

export const PatchGroupsView: React.FC<PatchGroupsViewProps> = ({
  patchGroups,
  originalPRCount,
  optimizedPRCount,
  reductionPercentage,
  onSelectGroupForPR,
  onTriggerValidation
}) => {
  return (
    <div className="space-y-6">
      {/* 60% Reduction Banner Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 rounded-xl p-6 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <TrendingDown className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Intelligent Patch Bundling & PR Optimization
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Standard dependency bots spam repository maintainers with isolated pull requests for every individual CVE. DependencyCheck verifies lockfile compatibility and bundles non-breaking upgrades into consolidated pull requests.
            </p>
          </div>

          {/* Metric Highlight Badge */}
          <div className="bg-slate-950/90 rounded-2xl p-4 border border-cyan-500/30 flex items-center space-x-4 shadow-xl shrink-0">
            <div className="text-center border-r border-slate-800 pr-4">
              <span className="text-xs text-slate-400 block font-medium">Without Grouping</span>
              <span className="text-2xl font-bold text-rose-400">{originalPRCount}</span>
              <span className="text-[10px] text-slate-500 block">Individual PRs</span>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-600" />

            <div className="text-center pl-2">
              <span className="text-xs text-slate-400 block font-medium">With DependencyCheck</span>
              <span className="text-3xl font-black text-cyan-400">{reductionPercentage}% ↓</span>
              <span className="text-[10px] text-emerald-400 font-medium block">
                Reduced to {optimizedPRCount} PR{optimizedPRCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Comparison (Before vs After) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Before: Fragmented */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <div className="text-slate-400 font-semibold font-sans mb-2 flex items-center justify-between">
              <span>Standard Bot PR Spam (Dependabot / Renovate):</span>
              <span className="text-rose-400">{originalPRCount} PRs</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {Array.from({ length: originalPRCount }).map((_, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1">
                  <GitPullRequest className="w-3 h-3 text-rose-400" /> PR #{i + 101}
                </div>
              ))}
            </div>
          </div>

          {/* After: DependencyCheck Groups */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-cyan-900/40">
            <div className="text-slate-200 font-semibold font-sans mb-2 flex items-center justify-between">
              <span className="text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> DependencyCheck Clean Bundles:
              </span>
              <span className="text-emerald-400">{patchGroups.length} Consolidated PRs</span>
            </div>
            <div className="space-y-1 text-[11px]">
              {patchGroups.map((g, i) => (
                <div key={g.id} className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="truncate">{g.title}</span>
                  </span>
                  <span className="text-emerald-400 shrink-0 font-sans font-medium text-[10px]">
                    Bundles {g.patches.length} updates
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patch Groups List */}
      <div className="space-y-4">
        {patchGroups.map((group, idx) => {
          const isSafe = group.groupType === 'SAFE_AUTOMATED';
          const isManual = group.groupType === 'HIGH_RISK_MANUAL_REVIEW';

          return (
            <div
              key={group.id}
              className={`rounded-xl p-5 border space-y-4 ${
                isSafe
                  ? 'bg-slate-900/90 border-emerald-900/40 shadow-sm'
                  : isManual
                  ? 'bg-slate-900/90 border-rose-900/40'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {/* Group Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded ${
                        isSafe
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isManual
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {group.groupType}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {group.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl">{group.description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onTriggerValidation(group)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                    <span>Run Sandbox</span>
                  </button>

                  <button
                    onClick={() => onSelectGroupForPR(group)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                  >
                    <GitPullRequest className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>View PR Artifact</span>
                  </button>
                </div>
              </div>

              {/* Patches in Group Table */}
              <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Package</th>
                      <th className="p-3">Version Upgrade</th>
                      <th className="p-3">CVEs Mitigated</th>
                      <th className="p-3">Reachability</th>
                      <th className="p-3">Breaking Risk</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono">
                    {group.patches.map(p => (
                      <tr key={p.packageName} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-white">{p.packageName}</td>
                        <td className="p-3 text-slate-300">
                          {p.currentVersion} <ArrowRight className="inline w-3 h-3 text-slate-500" />{' '}
                          <span className="text-emerald-400 font-semibold">{p.targetVersion}</span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {p.vulnerabilitiesFixed.join(', ')}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-sans font-semibold ${
                              p.isReachable
                                ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {p.isReachable ? 'REACHABLE' : 'UNREACHABLE'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-sans font-semibold ${
                              p.breakingRisk === 'SAFE'
                                ? 'text-emerald-400'
                                : p.breakingRisk === 'HIGH RISK'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {p.breakingRisk}
                          </span>
                        </td>
                        <td className="p-3 font-sans text-slate-300 font-medium text-[11px]">
                          {p.recommendedAction}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
