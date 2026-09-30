import React, { useState } from 'react';
import { SandboxValidationReport, PatchGroup } from '../types';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Hash,
  Cpu,
  Layers,
  Sparkles,
  Play
} from 'lucide-react';

interface SandboxValidationViewProps {
  initialReport?: SandboxValidationReport;
  patchGroups: PatchGroup[];
  onTriggerValidation: (group: PatchGroup) => Promise<SandboxValidationReport>;
}

export const SandboxValidationView: React.FC<SandboxValidationViewProps> = ({
  initialReport,
  patchGroups,
  onTriggerValidation
}) => {
  const [report, setReport] = useState<SandboxValidationReport | undefined>(initialReport);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);

  const activeGroup = patchGroups[selectedGroupIdx] || patchGroups[0];

  const handleRunValidation = async () => {
    if (!activeGroup) return;
    setIsValidating(true);
    try {
      const res = await onTriggerValidation(activeGroup);
      setReport(res);
    } finally {
      setIsValidating(false);
    }
  };

  const stages = report?.stages || [];
  const metrics = report?.deterministicMetrics;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Terminal className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-white">
              Deterministic Container Sandbox Validation
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Zero Host Exposure
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Dependency updates are tested inside an isolated sandbox environment with read-only rootfs and tmpfs memory mounts. Lockfiles are strictly resolved using <code className="text-emerald-400 font-mono">npm ci</code> to guarantee 100% reproducible builds.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedGroupIdx}
            onChange={e => setSelectedGroupIdx(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {patchGroups.map((g, i) => (
              <option key={g.id} value={i}>
                {g.title.slice(0, 35)}...
              </option>
            ))}
          </select>

          <button
            onClick={handleRunValidation}
            disabled={isValidating}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer shadow-md"
          >
            {isValidating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Sandbox...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Re-run Validation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Deterministic Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900 rounded-xl p-4 border border-slate-800 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Runtime Environment:</span>
            <span className="font-mono text-white font-bold">{metrics.nodeVersion}</span>
            <span className="text-slate-400 text-[10px] block">npm {metrics.npmVersion}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Lockfile SHA-256 (Before):</span>
            <span className="font-mono text-cyan-400 truncate block text-[11px] font-medium" title={metrics.lockfileHashBefore}>
              {metrics.lockfileHashBefore.slice(0, 16)}...
            </span>
            <span className="text-slate-400 text-[10px] block">Strict v3 lockfile</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Lockfile SHA-256 (After):</span>
            <span className="font-mono text-emerald-400 truncate block text-[11px] font-medium" title={metrics.lockfileHashAfter}>
              {metrics.lockfileHashAfter.slice(0, 16)}...
            </span>
            <span className="text-slate-400 text-[10px] block">Updated constraints</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Build Reproducibility:</span>
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Deterministic
            </span>
            <span className="text-slate-400 text-[10px] block">Tree: {metrics.dependencyTreeHash}</span>
          </div>
        </div>
      )}

      {/* Stage Logs & Interactive Console */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-mono text-slate-400 ml-2">
              sandbox-container-session.log ({report?.targetGroup || 'Session'})
            </span>
          </div>

          {report && (
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Total Duration: {report.durationMs}ms
            </span>
          )}
        </div>

        {/* Stage List */}
        <div className="divide-y divide-slate-800/80 font-mono text-xs">
          {stages.map((stage, idx) => {
            const isPassed = stage.status === 'passed';
            const isFailed = stage.status === 'failed';

            return (
              <div key={idx} className="p-4 hover:bg-slate-950/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isFailed ? (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                    )}
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                      Stage {idx + 1}: {stage.name.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-sans">
                    {stage.durationMs}ms
                  </span>
                </div>

                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 text-[11px] whitespace-pre-wrap leading-relaxed">
                  {stage.outputLog}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
