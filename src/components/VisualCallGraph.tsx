import React, { useState } from 'react';
import {
  Cpu,
  CornerDownRight,
  ShieldAlert,
  ShieldCheck,
  Code2,
  FileCode,
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

interface CallGraphPackage {
  id: string;
  name: string;
  version: string;
  status: 'REACHABLE' | 'UNREACHABLE' | 'SAFE';
  cveId: string;
  cvss: number;
  entrypoint: string;
  callerFile: string;
  callerLine: number;
  symbol: string;
  codeSnippet: string;
  explanation: string;
}

const PACKAGES_GRAPH: CallGraphPackage[] = [
  {
    id: 'jsonwebtoken',
    name: 'jsonwebtoken',
    version: '8.5.1',
    status: 'REACHABLE',
    cveId: 'CVE-2022-23529',
    cvss: 9.8,
    entrypoint: 'src/server.ts:18 (HTTP POST /api/auth/verify)',
    callerFile: 'src/routes/auth.ts',
    callerLine: 22,
    symbol: 'jwt.verify(token, getSecretKey())',
    codeSnippet: `// src/routes/auth.ts:22
import jwt from 'jsonwebtoken';

export function handleVerifyToken(req, res) {
  const token = req.headers['authorization']?.split(' ')[1];
  try {
    // ⚠️ CRITICAL AST REACHABILITY:
    // Insecure key object deserialization trigger
    const decoded = jwt.verify(token, getSecretKey());
    return res.json({ success: true, payload: decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Token' });
  }
}`,
    explanation: 'AST Traversal confirmed direct call to jwt.verify(). The vulnerable key parsing codepath is actively reachable from HTTP entrypoint.'
  },
  {
    id: 'axios',
    name: 'axios',
    version: '0.21.1',
    status: 'UNREACHABLE',
    cveId: 'CVE-2021-3749',
    cvss: 7.5,
    entrypoint: 'src/server.ts:34 (Telemetry Worker)',
    callerFile: 'src/services/metrics.ts',
    callerLine: 14,
    symbol: 'axios.post(endpoint, data)',
    codeSnippet: `// src/services/metrics.ts:14
import axios from 'axios';

export async function sendTelemetry(metrics) {
  // ✅ UNREACHABLE VULNERABILITY:
  // CVE-2021-3749 affects custom 'followRedirects' wrapper.
  // Code uses standard POST without maxRedirects or custom redirect handler.
  return await axios.post('https://metrics.internal/v1', metrics);
}`,
    explanation: 'AST confirmed invocation of axios.post(), but the vulnerable followRedirects symbol is NOT imported or called. Alert fatigue deferred safely.'
  },
  {
    id: 'lodash',
    name: 'lodash',
    version: '4.17.15',
    status: 'SAFE',
    cveId: 'CVE-2020-8203',
    cvss: 7.4,
    entrypoint: 'src/routes/user.ts:45',
    callerFile: 'src/utils/sanitize.ts',
    callerLine: 8,
    symbol: '_.pick(user, ["id", "email"])',
    codeSnippet: `// src/utils/sanitize.ts:8
import _ from 'lodash';

export function sanitizeUser(user) {
  // Safe utility call site - Patch to 4.17.21 is backwards compatible
  return _.pick(user, ['id', 'email', 'name']);
}`,
    explanation: 'AST confirmed standard _.pick usage. Backward-compatible patch to 4.17.21 available with zero breaking API risk.'
  }
];

export const VisualCallGraph: React.FC = () => {
  const [selectedPkgId, setSelectedPkgId] = useState<string>('jsonwebtoken');
  const currentPkg = PACKAGES_GRAPH.find(p => p.id === selectedPkgId) || PACKAGES_GRAPH[0];

  const isReachable = currentPkg.status === 'REACHABLE';
  const isUnreachable = currentPkg.status === 'UNREACHABLE';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold">
            <Cpu className="w-3.5 h-3.5" />
            <span>AST EXECUTION PATH TRACER</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight mt-1.5">
            Interactive Visual AST Call-Graph
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Static Abstract Syntax Tree analysis traces execution from network entrypoints down to package function invocations. Compare reachable vs dead codepaths in real time.
          </p>
        </div>

        {/* Package Selector Buttons */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
          {PACKAGES_GRAPH.map(pkg => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPkgId(pkg.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedPkgId === pkg.id
                  ? pkg.status === 'REACHABLE'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : pkg.status === 'UNREACHABLE'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{pkg.name}</span>
              <span className="text-[10px] opacity-80">({pkg.status})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Animated SVG Graph */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="text-center mb-6">
          <span className="text-xs font-mono text-slate-400">
            Active Trace for <strong className="text-white">{currentPkg.name}@{currentPkg.version}</strong> • {currentPkg.cveId} (CVSS {currentPkg.cvss})
          </span>
        </div>

        {/* SVG Flow Canvas */}
        <div className="relative max-w-4xl mx-auto py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 items-center">
            {/* Step 1: Entrypoint */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2 shadow-md">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                1. HTTP Entrypoint
              </span>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-white font-bold">
                POST /api/auth/verify
              </div>
              <p className="text-[10px] text-slate-500 font-mono">{currentPkg.entrypoint}</p>
            </div>

            {/* Step 2: Router / Controller */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2 shadow-md">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                2. Route Controller
              </span>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-white font-bold">
                {currentPkg.callerFile}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">AST Call Line {currentPkg.callerLine}</p>
            </div>

            {/* Step 3: Invocation Site */}
            <div className={`p-4 rounded-xl border text-center space-y-2 shadow-md transition-all ${
              isReachable
                ? 'bg-rose-950/40 border-rose-500/70 shadow-rose-500/10'
                : isUnreachable
                ? 'bg-amber-950/40 border-amber-500/70 shadow-amber-500/10'
                : 'bg-emerald-950/40 border-emerald-500/70 shadow-emerald-500/10'
            }`}>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isReachable ? 'text-rose-400' : isUnreachable ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                3. AST Call Site
              </span>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-white break-words">
                {currentPkg.symbol}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {isReachable ? '🔴 Active Invocation' : isUnreachable ? '🟡 Non-Vulnerable Method' : '🟢 Safe Helper'}
              </p>
            </div>

            {/* Step 4: Library Vulnerability Verdict */}
            <div className={`p-4 rounded-xl border text-center space-y-2 shadow-md transition-all ${
              isReachable
                ? 'bg-rose-900/30 border-rose-500 text-rose-300'
                : isUnreachable
                ? 'bg-slate-950 border-slate-800 text-slate-400'
                : 'bg-emerald-900/30 border-emerald-500 text-emerald-300'
            }`}>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">
                4. Final Verdict
              </span>
              <div className="text-base font-black font-mono">
                {currentPkg.status}
              </div>
              <span className="text-[10px] font-mono block">
                {isReachable ? 'Immediate Patch Required' : isUnreachable ? 'Safe to Defer' : 'Safe to Upgrade'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Call-Site Code Viewer */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Verified Source File Call Site:</span>
              </span>
              <span className="text-slate-500">{currentPkg.callerFile}:{currentPkg.callerLine}</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed shadow-inner">
              {currentPkg.codeSnippet}
            </pre>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>AST Traversal Verdict</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">{currentPkg.explanation}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase font-bold">CVE Identifier</div>
                <div className="text-white font-bold mt-0.5">{currentPkg.cveId}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase font-bold">CVSS Severity</div>
                <div className="text-rose-400 font-bold mt-0.5">{currentPkg.cvss} / 10.0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
