import React from 'react';
import { BreakingChangeAnalysis } from '../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, BookOpen, AlertOctagon } from 'lucide-react';

interface BreakingChangesViewProps {
  breakingChanges: BreakingChangeAnalysis[];
}

export const BreakingChangesView: React.FC<BreakingChangesViewProps> = ({ breakingChanges }) => {
  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <h2 className="text-base font-semibold text-white">
            Pre-Upgrade Breaking Change Risk Engine
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            Prevents Production Regressions
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Automated dependency upgrades frequently cause silent breaks when major semver boundaries drop exported APIs or rewrite runtime paradigms. DependencyCheck isolates risky major version upgrades from safe automated patch bundles.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {breakingChanges.map(change => {
          const isHighRisk = change.riskLevel === 'HIGH RISK';
          const isSafe = change.riskLevel === 'SAFE';

          return (
            <div
              key={change.packageName}
              className={`rounded-xl p-5 border space-y-4 ${
                isHighRisk
                  ? 'bg-slate-900 border-rose-900/40 shadow-sm'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-white font-mono">{change.packageName}</span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({change.currentVersion} <ArrowRight className="inline w-3 h-3 text-slate-500 mx-0.5" /> {change.targetVersion})
                  </span>
                </div>

                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono flex items-center gap-1 ${
                    isHighRisk
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : isSafe
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isHighRisk ? <AlertOctagon className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {change.riskLevel}
                </span>
              </div>

              {/* Version Leap Badge */}
              <div className="text-xs text-slate-400 flex items-center space-x-2">
                <span>SemVer Delta:</span>
                <span className="font-mono text-cyan-400 uppercase font-semibold">
                  {change.semverJump} upgrade
                </span>
              </div>

              {/* Breaking Reasons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Analysis Details:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {change.breakingReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-slate-500">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Removed Exports / Signature Changes */}
              {change.removedExports.length > 0 && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="text-rose-400 font-semibold text-[11px] block">
                    Removed Exports / Deprecated APIs:
                  </span>
                  <div className="flex flex-wrap gap-1 font-mono text-[11px] text-slate-300">
                    {change.removedExports.map((exp, idx) => (
                      <span key={idx} className="bg-rose-950/40 border border-rose-800/40 px-1.5 py-0.5 rounded text-rose-300">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Migration Guidance */}
              {change.migrationNotes && (
                <div className="pt-2 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Migration Guide
                  </span>
                  <a
                    href={change.migrationNotes}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 truncate max-w-xs"
                  >
                    View Upgrade Guide →
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
