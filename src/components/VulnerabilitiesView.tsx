import React, { useState } from 'react';
import { VulnerabilityAdvisory, ExploitabilityResult } from '../types';
import {
  ShieldAlert,
  Search,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Database
} from 'lucide-react';

interface VulnerabilitiesViewProps {
  vulnerabilities: VulnerabilityAdvisory[];
  exploitabilities: ExploitabilityResult[];
}

export const VulnerabilitiesView: React.FC<VulnerabilitiesViewProps> = ({
  vulnerabilities,
  exploitabilities
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredVulns = vulnerabilities.filter(v => {
    const matchesSearch =
      v.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || v.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search CVE ID, package, keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                severityFilter === sev
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Vulnerabilities Table / Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredVulns.map(vuln => {
          const exploit = exploitabilities.find(e => e.vulnerabilityId === vuln.id);
          const isReachable = exploit?.reachabilityStatus === 'REACHABLE';

          return (
            <div
              key={vuln.id}
              className="bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition space-y-4"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                      vuln.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : vuln.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {vuln.severity} ({vuln.cvss})
                  </span>
                  <span className="font-bold text-white font-mono text-sm">{vuln.id}</span>
                  <span className="text-slate-400 text-xs">in</span>
                  <code className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono text-emerald-400 text-xs font-semibold">
                    {vuln.package}
                  </code>
                </div>

                {/* Reachability Badge */}
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center space-x-1 ${
                      isReachable
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/50 animate-pulse'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50'
                    }`}
                  >
                    {isReachable ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span>REACHABLE (Active Exploit Risk)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>UNREACHABLE (Function Unused)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{vuln.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{vuln.description}</p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Affected Range:</span>
                  <span className="font-mono text-amber-300 font-medium">{vuln.affected_versions}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Fixed Version:</span>
                  <span className="font-mono text-emerald-400 font-bold">{vuln.fixed_version}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Vulnerable Functions:</span>
                  <span className="font-mono text-slate-300">
                    {vuln.vulnerable_functions && vuln.vulnerable_functions.length > 0
                      ? vuln.vulnerable_functions.join(', ')
                      : 'Not Isolated'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Data Feed Source:</span>
                  <span className="text-slate-300 flex items-center gap-1">
                    {vuln.source === 'OSV.dev' ? (
                      <Globe className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <Database className="w-3 h-3 text-emerald-400" />
                    )}
                    {vuln.source}
                  </span>
                </div>
              </div>

              {/* References & Links */}
              {vuln.references && vuln.references.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Advisories:</span>
                  {vuln.references.slice(0, 3).map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 truncate max-w-xs"
                    >
                      <span className="truncate">{ref.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
