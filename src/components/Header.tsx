import React from 'react';
import { Shield, Sparkles, Play, RefreshCw, Cpu, Layers } from 'lucide-react';

interface HeaderProps {
  onRunDemoScan: () => void;
  isScanning: boolean;
  projectName: string;
  timestamp: string;
  enableLiveOSV: boolean;
  onToggleLiveOSV: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRunDemoScan,
  isScanning,
  projectName,
  timestamp,
  enableLiveOSV,
  onToggleLiveOSV
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                DependencyCheck
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AST Reachability Engine
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Intelligent Triage, Breaking-Change Detection & 60%+ PR Optimizer
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* OSV Live Toggle */}
          <div className="hidden md:flex items-center bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <span className="text-slate-400 mr-2 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${enableLiveOSV ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              Live OSV.dev
            </span>
            <button
              onClick={() => onToggleLiveOSV(!enableLiveOSV)}
              className={`text-[11px] px-2 py-0.5 rounded transition font-medium ${
                enableLiveOSV
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {enableLiveOSV ? 'Active' : 'Curated Cache'}
            </button>
          </div>

          {/* Run Demo Scan Button */}
          <button
            onClick={onRunDemoScan}
            disabled={isScanning}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-semibold text-xs tracking-wide shadow-lg shadow-emerald-500/20 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Analyzing AST...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Run Demo Scan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
