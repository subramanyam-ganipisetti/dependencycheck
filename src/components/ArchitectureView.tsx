import React from 'react';
import {
  Shield,
  Layers,
  Lock,
  Terminal,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Zap,
  Server
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Lock className="w-4 h-4" />
          </span>
          <h2 className="text-base font-semibold text-white">
            Architecture, Defense-in-Depth & RFC Specifications
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
            Production Supply-Chain Security
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Comprehensive documentation of the DependencyCheck pipeline, sandbox isolation principles, AST reachability algorithms, and DevSecOps threat model.
        </p>
      </div>

      {/* Grid: 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Pipeline Flow */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <Layers className="w-4 h-4" />
            <span>1. Pipeline Stages</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
              1. Lockfile Ingestion (npm-lock v1/v2/v3)
            </div>
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
              2. Vulnerability Correlation (NVD/OSV/GHSA)
            </div>
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
              3. AST & Call-Tree Static Analysis
            </div>
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
              4. Breaking Change Risk Evaluation
            </div>
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
              5. Intelligent Grouping (≥60% PR Reduction)
            </div>
            <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
              6. Deterministic Sandbox Verification
            </div>
          </div>
        </div>

        {/* Pillar 2: Security Guardrails */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center space-x-2 text-rose-400 font-bold">
            <Shield className="w-4 h-4" />
            <span>2. Untrusted Input Protections</span>
          </div>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Path Traversal Defense:</strong> All uploaded filenames and relative references are sanitized to prevent directory breakout.
              </span>
            </li>
            <li className="flex items-start space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>No Host Execution:</strong> Code is never executed directly on the host server; all validation runs inside isolated tmpfs containers.
              </span>
            </li>
            <li className="flex items-start space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Token Redaction:</strong> GitHub PATs and cloud secrets are never echoed or leaked to client payloads.
              </span>
            </li>
            <li className="flex items-start space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Sliding Window Rate Limiter:</strong> Protects scan endpoints from abuse.
              </span>
            </li>
          </ul>
        </div>

        {/* Pillar 3: Deterministic Builds */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>3. Deterministic Builds</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Dependency updates strictly mandate <code className="text-emerald-400 font-mono">npm ci</code> rather than <code className="text-slate-400 font-mono">npm install</code>, guaranteeing byte-for-byte reproducibility across CI runners.
          </p>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div>• Node.js: v22.14.0 (Active LTS)</div>
            <div>• npm: 10.9.2</div>
            <div>• Lockfile Checksum: SHA-256</div>
            <div>• Dependency Tree Integrity: Validated</div>
          </div>
        </div>
      </div>

      {/* Static Analysis Limitations Statement */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3 text-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          AST Engine Limitations & Heuristic Boundaries (Transparent Disclosure)
        </h3>
        <p className="text-slate-300 leading-relaxed">
          Static analysis by design cannot observe dynamic runtime values. Specifically:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <strong className="text-white block mb-1">Dynamic Reflection / Computed Access:</strong>
            Calls like <code className="text-amber-300 font-mono">obj[variableName]()</code> or <code className="text-amber-300 font-mono">eval(code)</code> cannot be resolved statically. When detected, the engine demotes confidence to <strong>MEDIUM</strong> or <strong>POTENTIALLY_REACHABLE</strong>.
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <strong className="text-white block mb-1">Transitive Indirect Callbacks:</strong>
            If a 3rd party library internally invokes another transitive vulnerable dependency without exposing it through project imports, call-graph confidence is appropriately calibrated.
          </div>
        </div>
      </div>
    </div>
  );
};
