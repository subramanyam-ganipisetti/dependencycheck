import React, { useState } from 'react';
import { GeneratedPRArtifact, PatchGroup } from '../types';
import {
  GitPullRequest,
  Copy,
  Check,
  Terminal,
  FileCode2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  GitBranch,
  Layers
} from 'lucide-react';

interface PRArtifactViewProps {
  prArtifacts: GeneratedPRArtifact[];
  patchGroups: PatchGroup[];
}

export const PRArtifactView: React.FC<PRArtifactViewProps> = ({
  prArtifacts,
  patchGroups
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const currentArtifact = prArtifacts[selectedIdx] || prArtifacts[0];
  const currentGroup = patchGroups[selectedIdx] || patchGroups[0];

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (!currentArtifact) {
    return (
      <div className="bg-slate-900 rounded-xl p-8 text-center text-slate-400">
        No PR artifacts generated yet.
      </div>
    );
  }

  const githubActionWorkflow = `name: DependencyCheck Automated Patch Verification

on:
  pull_request:
    branches: [ main, master ]

jobs:
  validate-supply-chain:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js (Deterministic LTS)
        uses: actions/setup-node@v4
        with:
          node-version: '22.x'
          cache: 'npm'

      - name: Deterministic Install
        run: npm ci --ignore-scripts

      - name: Run AST Reachability Guard
        run: npx dependencycheck --verify-pr

      - name: Run Test Suite
        run: npm test -- --ci
`;

  return (
    <div className="space-y-6">
      {/* Selector Bar */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <GitPullRequest className="w-4 h-4 text-emerald-400" />
            Automated PR Engine & Dry-Run Artifacts
          </h2>
          <p className="text-xs text-slate-400">
            Preview, copy, or dry-run consolidated security pull requests ready for GitHub.
          </p>
        </div>

        {/* Group Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {prArtifacts.map((art, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              PR #{idx + 1}: {patchGroups[idx]?.groupType === 'SAFE_AUTOMATED' ? 'Safe Bundle' : 'Manual Review'}
            </button>
          ))}
        </div>
      </div>

      {/* GitHub PR Preview Mockup */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        {/* Mock GitHub Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                <GitPullRequest className="w-3 h-3" /> Open
              </span>
              <h3 className="text-base font-bold text-white">{currentArtifact.prTitle}</h3>
            </div>

            <div className="text-xs text-slate-400 flex items-center space-x-2 font-mono">
              <span className="text-slate-500">Branch:</span>
              <span className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                <GitBranch className="w-3 h-3" /> {currentArtifact.branchName}
              </span>
              <span className="text-slate-500">into</span>
              <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                main
              </span>
            </div>
          </div>

          {/* Quick Copy Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopy(currentArtifact.branchName, 'branch')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 border border-slate-700 transition cursor-pointer"
            >
              {copiedType === 'branch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Branch</span>
            </button>

            <button
              onClick={() => handleCopy(currentArtifact.prBodyMarkdown, 'markdown')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              {copiedType === 'markdown' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
              <span>Copy Full PR Body</span>
            </button>
          </div>
        </div>

        {/* PR Markdown Body Preview */}
        <div className="p-6 bg-slate-900 text-slate-200 text-xs font-sans leading-relaxed overflow-x-auto space-y-4">
          <div className="prose prose-invert max-w-none text-xs">
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-slate-300 text-xs whitespace-pre-wrap">
              {currentArtifact.prBodyMarkdown}
            </pre>
          </div>
        </div>
      </div>

      {/* Local Git CLI Runner Box */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Dry-Run / Local Developer Execution Commands
          </h3>
          <button
            onClick={() => handleCopy(currentArtifact.gitCommands.join('\n'), 'git')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition cursor-pointer"
          >
            {copiedType === 'git' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            Copy Shell Commands
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
          {currentArtifact.gitCommands.map((cmd, idx) => (
            <div key={idx} className={cmd.startsWith('#') ? 'text-slate-500' : 'text-emerald-300'}>
              {cmd}
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Action CI Workflow Template */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            CI/CD Pipeline Guardrail (.github/workflows/dependencycheck.yml)
          </h3>
          <button
            onClick={() => handleCopy(githubActionWorkflow, 'ci')}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition cursor-pointer"
          >
            {copiedType === 'ci' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            Copy Workflow YAML
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
          {githubActionWorkflow}
        </pre>
      </div>
    </div>
  );
};
