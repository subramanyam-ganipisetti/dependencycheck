import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  GitBranch,
  Layers,
  ArrowRight,
  ShieldCheck,
  Split,
  Maximize2
} from 'lucide-react';
import { downloadFile } from '../utils/exportUtils';

interface DiffLine {
  type: 'add' | 'del' | 'same';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

const PACKAGE_JSON_DIFF: DiffLine[] = [
  { type: 'same', oldLineNumber: 1, newLineNumber: 1, content: '  "dependencies": {' },
  { type: 'same', oldLineNumber: 2, newLineNumber: 2, content: '    "axios": "^0.21.1",' },
  { type: 'same', oldLineNumber: 3, newLineNumber: 3, content: '    "dotenv": "^16.0.3",' },
  { type: 'del', oldLineNumber: 4, content: '-   "jsonwebtoken": "8.5.1",' },
  { type: 'add', newLineNumber: 4, content: '+   "jsonwebtoken": "9.0.0",' },
  { type: 'del', oldLineNumber: 5, content: '-   "lodash": "4.17.15",' },
  { type: 'add', newLineNumber: 5, content: '+   "lodash": "4.17.21",' },
  { type: 'del', oldLineNumber: 6, content: '-   "minimist": "1.2.5",' },
  { type: 'add', newLineNumber: 6, content: '+   "minimist": "1.2.6",' },
  { type: 'del', oldLineNumber: 7, content: '-   "semver": "7.3.5"' },
  { type: 'add', newLineNumber: 7, content: '+   "semver": "7.5.4"' },
  { type: 'same', oldLineNumber: 8, newLineNumber: 8, content: '  }' }
];

const LOCKFILE_DIFF: DiffLine[] = [
  { type: 'same', oldLineNumber: 142, newLineNumber: 142, content: '    "node_modules/lodash": {' },
  { type: 'del', oldLineNumber: 143, content: '-     "version": "4.17.15",' },
  { type: 'add', newLineNumber: 143, content: '+     "version": "4.17.21",' },
  { type: 'del', oldLineNumber: 144, content: '-     "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.15.tgz",' },
  { type: 'add', newLineNumber: 144, content: '+     "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",' },
  { type: 'del', oldLineNumber: 145, content: '-     "integrity": "sha512-8xOcRHvCjnocdS5mj8tLNUYW7cPVJKG1Fc32ljNM6URNpeZ2+Bo2FK49bGD/iqVEYzuUBuZEDhHU556gw66wEQ=="' },
  { type: 'add', newLineNumber: 145, content: '+     "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg=="' },
  { type: 'same', oldLineNumber: 146, newLineNumber: 146, content: '    },' },
  { type: 'same', oldLineNumber: 147, newLineNumber: 147, content: '    "node_modules/minimist": {' },
  { type: 'del', oldLineNumber: 148, content: '-     "version": "1.2.5",' },
  { type: 'add', newLineNumber: 148, content: '+     "version": "1.2.6",' },
  { type: 'del', oldLineNumber: 149, content: '-     "resolved": "https://registry.npmjs.org/minimist/-/minimist-1.2.5.tgz"' },
  { type: 'add', newLineNumber: 149, content: '+     "resolved": "https://registry.npmjs.org/minimist/-/minimist-1.2.6.tgz"' },
  { type: 'same', oldLineNumber: 150, newLineNumber: 150, content: '    }' }
];

export const LockfileDiffViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<'package.json' | 'package-lock.json'>('package.json');
  const [copied, setCopied] = useState(false);

  const activeDiff = selectedFile === 'package.json' ? PACKAGE_JSON_DIFF : LOCKFILE_DIFF;

  const handleCopyDiff = () => {
    const rawText = activeDiff.map(l => l.content).join('\n');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPatch = () => {
    const patchHeader = `--- a/${selectedFile}\n+++ b/${selectedFile}\n@@ -1,12 +1,12 @@\n`;
    const patchBody = activeDiff.map(l => l.content).join('\n');
    downloadFile(patchHeader + patchBody, `${selectedFile}-security-fix.patch`, 'text/plain');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold">
            <Split className="w-3.5 h-3.5" />
            <span>VISUAL MANIFEST DIFF ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Side-by-Side Lockfile Diff Viewer</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare vulnerable version definitions with verified target patches in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* File Switcher */}
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSelectedFile('package.json')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedFile === 'package.json'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              package.json
            </button>
            <button
              onClick={() => setSelectedFile('package-lock.json')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedFile === 'package-lock.json'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              package-lock.json
            </button>
          </div>

          <button
            onClick={handleCopyDiff}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            title="Copy diff to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Diff'}</span>
          </button>

          <button
            onClick={handleDownloadPatch}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold"
            title="Download .patch file"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export .patch</span>
          </button>
        </div>
      </div>

      {/* GitHub-style Code Diff Box */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl font-mono text-xs">
        {/* Diff Header */}
        <div className="bg-slate-900 p-3 border-b border-slate-800 flex items-center justify-between text-slate-400 text-xs">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">{selectedFile}</span>
            <span className="text-[11px] text-slate-500">• 4 additions (+), 4 deletions (-)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              SAFE BUMP PASS
            </span>
          </div>
        </div>

        {/* Lines */}
        <div className="overflow-x-auto divide-y divide-slate-900/40">
          {activeDiff.map((line, idx) => {
            const isAdd = line.type === 'add';
            const isDel = line.type === 'del';

            return (
              <div
                key={idx}
                className={`flex items-center py-1 px-3 ${
                  isAdd
                    ? 'bg-emerald-950/30 text-emerald-300 border-l-4 border-l-emerald-500'
                    : isDel
                    ? 'bg-rose-950/30 text-rose-300 border-l-4 border-l-rose-500'
                    : 'text-slate-400 hover:bg-slate-900/30'
                }`}
              >
                {/* Old line number */}
                <span className="w-10 text-right text-[11px] text-slate-600 select-none mr-2 font-mono">
                  {line.oldLineNumber || ''}
                </span>

                {/* New line number */}
                <span className="w-10 text-right text-[11px] text-slate-600 select-none mr-3 font-mono">
                  {line.newLineNumber || ''}
                </span>

                {/* Content */}
                <span className="whitespace-pre flex-1 select-text">
                  {line.content}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
