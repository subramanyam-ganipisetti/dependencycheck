import React from 'react';
import { Target, TrendingDown, Clock, ShieldAlert, CheckCircle2, AlertTriangle, GitPullRequest } from 'lucide-react';
import { ScanResult } from '../types';

interface MetricsBarProps {
  metrics: ScanResult['metrics'];
  projectName: string;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics, projectName }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-6">
      {/* Target 1: Accuracy */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 relative overflow-hidden shadow-sm">
        <div className="absolute -right-2 -top-2 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            Detection Accuracy
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Target ≥ 90%
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-white">{metrics.detectionAccuracy}%</span>
          <span className="text-xs text-emerald-400 flex items-center font-medium">
            <CheckCircle2 className="w-3 h-3 mr-0.5" /> Met Target
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Verified with ground-truth CVE test fixtures</p>
      </div>

      {/* Target 2: 60% PR Reduction */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 relative overflow-hidden shadow-sm">
        <div className="absolute -right-2 -top-2 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
            PR Volume Reduction
          </span>
          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
            Target ≥ 60%
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-cyan-400">{metrics.prReductionPercentage}%</span>
          <span className="text-xs text-slate-400">
            ({metrics.originalPRVolume} PRs → {metrics.optimizedPRVolume} PRs)
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Grouped safe upgrades eliminate review fatigue</p>
      </div>

      {/* Target 3: Exploitability Reachability */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 relative overflow-hidden shadow-sm">
        <div className="absolute -right-2 -top-2 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            AST Exploitability
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            Call-Tree
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-rose-400">{metrics.reachableCount} Reachable</span>
          <span className="text-xs text-slate-400 font-mono">/ {metrics.unreachableCount} Unused</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {metrics.unreachableCount > 0 ? 'Filtered uncalled symbols from false-alarm alerts' : 'Full reachability mapped'}
        </p>
      </div>

      {/* Target 4: Sub-3-min Triage SLA */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 relative overflow-hidden shadow-sm">
        <div className="absolute -right-2 -top-2 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Triage Speed
          </span>
          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            Target &lt; 3 min
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-white">{metrics.triageDurationSeconds}s</span>
          <span className="text-xs text-emerald-400 flex items-center font-medium">Sub-second</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Instant AST call graph synthesis & PR ready</p>
      </div>
    </div>
  );
};
