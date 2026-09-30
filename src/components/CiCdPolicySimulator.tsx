import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  RefreshCw,
  Terminal,
  CheckCircle2,
  XCircle,
  Sliders,
  Sparkles,
  Lock,
  GitPullRequest
} from 'lucide-react';

interface PolicyRule {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export const CiCdPolicySimulator: React.FC = () => {
  const [rules, setRules] = useState<PolicyRule[]>([
    {
      id: 'block_reachable_critical',
      title: 'Block Pipeline on Reachable Critical CVEs',
      description: 'Fail CI/CD build if any vulnerability with CVSS ≥ 9.0 has an actively reachable AST call-site in project source files.',
      enabled: true,
      severity: 'CRITICAL'
    },
    {
      id: 'allow_unreachable_deferral',
      title: 'Permit Safe Deferral of Unreachable CVEs',
      description: 'Do not fail build for vulnerabilities where vulnerable symbols are proven uncalled by AST analysis.',
      enabled: true,
      severity: 'MEDIUM'
    },
    {
      id: 'enforce_pr_reduction',
      title: 'Enforce ≥60% PR Volume Consolidation',
      description: 'Require automated patch bundler to group non-breaking upgrades into consolidated PRs before notifying developers.',
      enabled: true,
      severity: 'HIGH'
    },
    {
      id: 'require_sandbox_determinism',
      title: 'Strict Sandbox npm ci Determinism Check',
      description: 'Verify before/after SHA-256 lockfile hashes in isolated tmpfs container with --ignore-scripts.',
      enabled: true,
      severity: 'HIGH'
    },
    {
      id: 'quarantine_major_breaking',
      title: 'Quarantine Major SemVer Breaking Upgrades',
      description: 'Route major version leaps (e.g., redis 3.x -> 4.x) to security review rather than auto-merging.',
      enabled: true,
      severity: 'CRITICAL'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    status: 'PASSED' | 'BLOCKED';
    exitCode: number;
    logs: string[];
    blockingReasons: string[];
  } | null>(null);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const runEvaluation = async () => {
    setIsRunning(true);
    setEvaluationResult(null);

    await new Promise(r => setTimeout(r, 600));

    const blockReachable = rules.find(r => r.id === 'block_reachable_critical')?.enabled;
    const allowUnreachable = rules.find(r => r.id === 'allow_unreachable_deferral')?.enabled;
    const enforceReduction = rules.find(r => r.id === 'enforce_pr_reduction')?.enabled;
    const enforceDeterminism = rules.find(r => r.id === 'require_sandbox_determinism')?.enabled;

    const logs: string[] = [
      '[CI-RUNNER] Starting DependencyCheck Security Gate (GitHub Actions v4)...',
      '[CI-RUNNER] Loading security policy configuration (.dependencycheck.yml)...',
      `[POLICY] Rule 'Block Reachable Critical': ${blockReachable ? 'ENABLED' : 'DISABLED'}`,
      `[POLICY] Rule 'Permit Unreachable Deferral': ${allowUnreachable ? 'ENABLED' : 'DISABLED'}`,
      `[POLICY] Rule 'Enforce PR Consolidation': ${enforceReduction ? 'ENABLED' : 'DISABLED'}`,
      `[POLICY] Rule 'Sandbox Determinism': ${enforceDeterminism ? 'ENABLED' : 'DISABLED'}`,
      '--------------------------------------------------------------------------------',
      '[EVAL] Scanning dependencies against curated OSV / GHSA databases...',
      '[EVAL] Found 5 active advisories in cloud-nexus-api.',
      '[AST-ENGINE] Analyzing 69 lines of code across project source files...',
      '[AST-ENGINE] jsonwebtoken@8.5.1 -> jwt.verify() REACHABLE at src/routes/auth.ts:22',
      '[AST-ENGINE] axios@0.21.1 -> followRedirects UNREACHABLE (Safe)',
      '[SANDBOX] Deterministic container test suite: 24 passed, 0 failed.',
      '[OPTIMIZER] PR consolidation achieved 66.7% reduction (Target: ≥60%).'
    ];

    const blockingReasons: string[] = [];

    // Check if reachable CVE causes a block
    if (blockReachable) {
      blockingReasons.push('Active Reachable Critical CVE-2022-23529 detected in jsonwebtoken@8.5.1 at src/routes/auth.ts:22');
      logs.push('[GATE-FAIL] ❌ Policy violation: Reachable Critical CVE detected!');
      logs.push('[GATE-FAIL] Suggested Action: Apply automated patch candidate jsonwebtoken@9.0.0.');
    }

    const isBlocked = blockingReasons.length > 0;
    if (isBlocked) {
      logs.push('--------------------------------------------------------------------------------');
      logs.push('[CI-RUNNER] ❌ Quality Gate Status: FAILED (Exit code: 1)');
      logs.push('[CI-RUNNER] Merge blocked. Pull Request requires security remediation.');
    } else {
      logs.push('--------------------------------------------------------------------------------');
      logs.push('[CI-RUNNER] ✅ Quality Gate Status: PASSED (Exit code: 0)');
      logs.push('[CI-RUNNER] All supply-chain policy checks satisfied. Merge permitted.');
    }

    setEvaluationResult({
      status: isBlocked ? 'BLOCKED' : 'PASSED',
      exitCode: isBlocked ? 1 : 0,
      logs,
      blockingReasons
    });

    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold">
            <Sliders className="w-3.5 h-3.5" />
            <span>DEVSECOPS POLICY ENFORCEMENT</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">CI/CD Security Gate Simulator</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test policy rules to prevent vulnerable or untested packages from reaching production.
          </p>
        </div>

        <button
          onClick={runEvaluation}
          disabled={isRunning}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-cyan-500/10"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Evaluating Pipeline...' : 'Run CI/CD Security Gate →'}</span>
        </button>
      </div>

      {/* Rules Config List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map(rule => (
          <div
            key={rule.id}
            onClick={() => toggleRule(rule.id)}
            className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
              rule.enabled
                ? 'bg-slate-900 border-cyan-500/50 shadow-md'
                : 'bg-slate-950/60 border-slate-800 opacity-60'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white">{rule.title}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  rule.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {rule.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{rule.description}</p>
            </div>

            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors shrink-0 mt-1 ${
              rule.enabled ? 'bg-cyan-500' : 'bg-slate-800'
            }`}>
              <div className={`w-3 h-3 rounded-full bg-slate-950 transition-transform ${
                rule.enabled ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {/* Execution Results / Terminal Runner Log */}
      {evaluationResult && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 font-mono text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              {evaluationResult.status === 'PASSED' ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>CI/CD QUALITY GATE PASSED (EXIT CODE: 0)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <XCircle className="w-5 h-5" />
                  <span>CI/CD QUALITY GATE BLOCKED (EXIT CODE: 1)</span>
                </div>
              )}
            </div>

            <span className="text-slate-500 text-[11px]">Runner: GitHub Actions Ubuntu-22.04</span>
          </div>

          {evaluationResult.blockingReasons.length > 0 && (
            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-1">
              <span className="text-rose-400 font-bold block text-[11px]">Enforcement Violations:</span>
              <ul className="list-disc pl-4 text-slate-300 space-y-0.5">
                {evaluationResult.blockingReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Terminal Console */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 max-h-60 overflow-y-auto space-y-1 text-slate-300 leading-relaxed text-[11px]">
            {evaluationResult.logs.map((log, idx) => {
              const isFail = log.includes('❌') || log.includes('FAILED');
              const isPass = log.includes('✅') || log.includes('PASSED');
              const isWarn = log.includes('REACHABLE');

              return (
                <div
                  key={idx}
                  className={
                    isFail ? 'text-rose-400 font-bold' : isPass ? 'text-emerald-400 font-bold' : isWarn ? 'text-amber-300' : 'text-slate-400'
                  }
                >
                  {log}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
