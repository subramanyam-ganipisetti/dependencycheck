import React, { useState, useRef } from 'react';
import { PublicScanReport, PublicDependencyItem } from '../types';
import { downloadFile, generateMarkdownAuditReport, generateCycloneDX_SBOM } from '../utils/exportUtils';
import {
  Shield,
  Upload,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
  FileCode,
  Layers,
  Sparkles,
  RefreshCw,
  GitPullRequest,
  Check
} from 'lucide-react';

interface PublicPortalProps {
  onScanZip: (file: File) => Promise<void>;
  onSampleScan: (type: 'python' | 'node') => Promise<void>;
  scanStatus: 'idle' | 'processing' | 'completed' | 'error';
  scanProgress: number;
  scanStep: number;
  report: PublicScanReport | null;
  errorMessage: string | null;
  onReset: () => void;
  onOpenAdminLogin: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  onScanZip,
  onSampleScan,
  scanStatus,
  scanProgress,
  scanStep,
  report,
  errorMessage,
  onReset,
  onOpenAdminLogin
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const lower = file.name.toLowerCase();
      if (
        lower.endsWith('.zip') ||
        lower.endsWith('.json') ||
        lower.endsWith('.txt') ||
        lower.endsWith('.lock')
      ) {
        onScanZip(file);
      } else {
        alert('Please drop a project .zip archive, package.json, or requirements.txt file.');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onScanZip(files[0]);
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. IDLE STATE: Hero & Uploader */}
      {scanStatus === 'idle' && !report && (
        <div className="space-y-10 py-4">
          {/* Hero */}
          <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Zero-Configuration Dependency Analysis</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Find vulnerable & outdated packages before they become a problem.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload your software project ZIP or manifest directly. DependencyCheck automatically extracts package manifests, scans OSV databases, and computes code metrics without exposing your code.
            </p>
          </div>

          {/* Drag & Drop Card */}
          <div className="max-w-xl mx-auto space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-12 rounded-2xl bg-slate-900/80 border-2 border-dashed transition-all duration-200 text-center space-y-4 cursor-pointer backdrop-blur-md ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/20 shadow-xl shadow-cyan-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".zip,.json,.txt,.lock"
                className="hidden"
              />

              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                <Upload className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Drop your project ZIP or package.json here</h3>
                <p className="text-xs text-slate-400">Supports .zip archives, package.json, and requirements.txt</p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">.zip</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">package.json</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">requirements.txt</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400">Max size: 100 MB</span>
              </div>
            </div>

            {/* Quick Demo Options */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-mono">Don't have a ZIP file ready?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSampleScan('python')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold font-mono text-xs border border-slate-700 transition cursor-pointer"
                >
                  ⚡ Test Python Service
                </button>
                <button
                  type="button"
                  onClick={() => onSampleScan('node')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold font-mono text-xs border border-slate-700 transition cursor-pointer"
                >
                  ⚡ Test Node.js Service
                </button>
              </div>
            </div>
          </div>

          {/* Telemetry Feature Cards */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="text-center space-y-1">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                Comprehensive Telemetry
              </h3>
              <h4 className="text-xl font-bold text-white">What Does DependencyCheck Analyze?</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {[
                { title: '📊 Code Metrics', desc: 'Accurate non-empty Lines of Code (LOC), language breakdown, and project file counts.', badge: 'Calculated' },
                { title: '📦 Dependencies', desc: 'Scans package.json, package-lock.json, requirements.txt, pyproject.toml, and Pipfiles.', badge: 'npm • pip' },
                { title: '🛡️ Security CVEs', desc: 'Correlates against Open Source Vulnerabilities (OSV.dev) and GitHub Advisory feeds.', badge: 'Live DB' },
                { title: '⚡ Outdated Packages', desc: 'Identifies packages with published safe version upgrades and recommended targets.', badge: 'SemVer' },
                { title: '🧠 AST Reachability', desc: 'Analyzes whether vulnerable package functions are actually called in code files.', badge: 'AST Engine' },
                { title: '🔀 Git & PR History', desc: 'Inspects embedded .git metadata if included, or integrates with GitHub for PR auditing.', badge: 'Transparent' },
              ].map((card, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{card.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">{card.badge}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sandboxed Guarantee */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
            <span className="text-emerald-400 text-lg shrink-0">🔒</span>
            <span>
              <strong className="text-slate-200">Public Scan Isolation Promise:</strong> Uploaded archives are extracted into isolated memory buffers with strict path-traversal prevention. No arbitrary scripts (such as <code className="text-cyan-400">npm install</code> or <code className="text-cyan-400">setup.py</code>) are executed.
            </span>
          </div>
        </div>
      )}

      {/* 2. PROCESSING PIPELINE ANIMATION */}
      {scanStatus === 'processing' && (
        <div className="max-w-xl mx-auto py-8 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>ANALYZING PROJECT</span>
              </div>
              <h3 className="text-lg font-bold text-white">Public Dependency Scan in Progress</h3>
              <p className="text-xs text-slate-400 font-mono">Running sandboxed static analysis and OSV correlation...</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Progress</span>
                <span className="text-cyan-400 font-bold">{scanProgress}% Complete</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            {/* 11-Step Progress Checklist */}
            <div className="space-y-1.5 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
              {[
                "Extracting project securely",
                "Detecting programming languages",
                "Calculating Lines of Code (LOC)",
                "Detecting Git metadata (.git history)",
                "Detecting package manifests (package.json / requirements.txt)",
                "Scanning npm dependencies",
                "Scanning pip dependencies",
                "Checking vulnerability databases (OSV.dev)",
                "Checking outdated package versions",
                "Running AST reachability analysis",
                "Generating public security report"
              ].map((label, idx) => {
                const num = idx + 1;
                const isDone = scanStep > num;
                const isCurrent = scanStep === num;

                return (
                  <div key={idx} className="flex items-center gap-2 py-0.5">
                    {isDone ? (
                      <span className="text-emerald-400 font-bold">✓</span>
                    ) : isCurrent ? (
                      <span className="text-cyan-400 font-bold animate-pulse">●</span>
                    ) : (
                      <span className="text-slate-600">○</span>
                    )}
                    <span className={isDone ? 'text-slate-300' : isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. COMPLETED PUBLIC REPORT */}
      {scanStatus === 'completed' && report && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 border-l-4 border-l-cyan-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                  SCAN COMPLETE ✓
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {report.scan_id}</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                Project Security Report: {report.project_name}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Source: {report.filename} • Scanned {new Date(report.scanned_at).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onReset}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Scan Another
              </button>
              <button
                onClick={() => {
                  const md = generateMarkdownAuditReport(report);
                  downloadFile(md, `${report.project_name}-security-audit.md`, 'text/markdown');
                }}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                title="Download Executive Markdown Report"
              >
                📄 Export Audit (.md)
              </button>
              <button
                onClick={() => {
                  const sbom = generateCycloneDX_SBOM(report);
                  downloadFile(sbom, `${report.project_name}-cyclonedx-sbom.json`, 'application/json');
                }}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                title="Download CycloneDX SBOM"
              >
                📦 CycloneDX SBOM
              </button>
              <button
                onClick={onOpenAdminLogin}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Remediation</span>
              </button>
            </div>
          </div>

          {/* 4 Main Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* LOC */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-mono font-medium">LINES OF CODE</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {report.code_metrics.total_lines_of_code.toLocaleString()}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono pt-1">
                Across {report.code_metrics.total_files} project files
              </div>
            </div>

            {/* Commits */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-mono font-medium">COMMITS</div>
              <div className="text-xl sm:text-2xl font-black text-slate-300 font-mono">
                {report.code_metrics.commits.count !== null ? report.code_metrics.commits.count : 'Unavailable'}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight pt-1">
                {report.code_metrics.commits.source}
              </div>
            </div>

            {/* Pull Requests */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-mono font-medium">PULL REQUESTS</div>
              <div className="text-xl sm:text-2xl font-black text-slate-300 font-mono">
                {report.code_metrics.pull_requests.count !== null ? report.code_metrics.pull_requests.count : 'Unavailable'}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight pt-1">
                Connect GitHub in Admin SOC
              </div>
            </div>

            {/* Dependencies */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-mono font-medium">DEPENDENCIES</div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                {report.dependency_metrics.total_dependencies}
              </div>
              <div className="text-[10px] text-cyan-300/80 font-mono pt-1">
                Unique packages detected
              </div>
            </div>
          </div>

          {/* Security Posture Summary Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                  Security Posture Assessment
                </span>
                <h3 className="text-lg font-bold text-white">Overall Dependency Health & Risk Breakdown</h3>
              </div>

              {/* Gauge */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-3xl font-black text-cyan-400 block">{report.security_posture_score} / 100</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase">GRADE {report.dependency_health_grade}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-1">
                <div className="text-xl font-bold text-emerald-400">{report.dependency_metrics.safe_dependencies}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Safe Packages</div>
              </div>
              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-1">
                <div className="text-xl font-bold text-amber-400">{report.dependency_metrics.outdated_dependencies}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Outdated Packages</div>
              </div>
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-1">
                <div className="text-xl font-bold text-rose-400">{report.dependency_metrics.vulnerable_dependencies}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Vulnerable Packages</div>
              </div>
              <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-xl space-y-1">
                <div className="text-xl font-bold text-cyan-400">{report.dependency_metrics.total_vulnerability_findings}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Vulnerability Findings</div>
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono font-bold text-slate-300 uppercase">Finding Severity Distribution:</div>
              <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-rose-400 font-bold">{report.severity_counts.CRITICAL}</span> Critical
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-amber-400 font-bold">{report.severity_counts.HIGH}</span> High
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-amber-300 font-bold">{report.severity_counts.MEDIUM}</span> Medium
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-blue-400 font-bold">{report.severity_counts.LOW}</span> Low
                </div>
              </div>
            </div>
          </div>

          {/* Dependency Inventory Table */}
          <div className="rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-md">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Detected Packages & Health Status</h3>
              <span className="text-xs font-mono text-slate-400">{report.dependencies.length} packages</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">Installed Version</th>
                    <th className="py-3 px-4">Ecosystem</th>
                    <th className="py-3 px-4">Health Status</th>
                    <th className="py-3 px-4">AST Reachability</th>
                    <th className="py-3 px-4 text-right">Recommended Fix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {report.dependencies.map(d => (
                    <tr key={d.package_name} className="hover:bg-slate-950/40 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        {d.package_name}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {d.current_version}
                      </td>
                      <td className="py-3 px-4 text-slate-500 uppercase">
                        {d.ecosystem}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.status === 'safe'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : d.status === 'vulnerable'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {d.reachability === 'reachable' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                            <span>REACHABLE ({d.reachability_confidence}%)</span>
                          </span>
                        ) : d.reachability === 'untapped' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>UNTAPPED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            <span>UNREACHABLE</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {d.recommended_fix ? (
                          <span className="text-emerald-400 font-semibold">{d.recommended_fix}</span>
                        ) : (
                          <span className="text-slate-500">Up to date</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ERROR STATE */}
      {scanStatus === 'error' && (
        <div className="max-w-lg mx-auto py-12 text-center space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-rose-900/50 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl mx-auto">
              ⚠️
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-rose-300">Scan Execution Failed</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{errorMessage}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs space-y-2">
              <span className="text-slate-300 font-bold block">💡 How to fix this:</span>
              <ul className="text-slate-400 space-y-1 text-[11px] list-disc pl-4">
                <li>You can drop your <strong className="text-cyan-300">package.json</strong> or <strong className="text-cyan-300">requirements.txt</strong> directly without needing to zip it.</li>
                <li>If uploading a .zip, ensure it was compressed using standard ZIP format (not renamed .rar or .tar.gz).</li>
                <li>Or try one of our instant pre-configured test services below:</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onReset}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => onSampleScan('node')}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                ⚡ Test Node.js Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
