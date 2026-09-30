import React, { useState } from 'react';
import {
  UploadCloud,
  FileCode,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  DEMO_PACKAGE_JSON,
  DEMO_PACKAGE_LOCK_JSON,
  DEMO_SOURCE_FILES
} from '../demo/demoRepository';
import { FileInputItem } from '../types';

interface CustomScannerViewProps {
  onExecuteScan: (params: {
    projectName: string;
    packageJson: string;
    lockfile: string;
    sourceFiles: FileInputItem[];
    enableLiveOSV: boolean;
  }) => Promise<void>;
  isScanning: boolean;
  enableLiveOSV: boolean;
}

export const CustomScannerView: React.FC<CustomScannerViewProps> = ({
  onExecuteScan,
  isScanning,
  enableLiveOSV
}) => {
  const [projectName, setProjectName] = useState('custom-service-app');
  const [packageJson, setPackageJson] = useState(DEMO_PACKAGE_JSON);
  const [lockfile, setLockfile] = useState(DEMO_PACKAGE_LOCK_JSON);
  const [activeCodeFileIdx, setActiveCodeFileIdx] = useState(1); // default to auth.ts
  const [sourceFiles, setSourceFiles] = useState<FileInputItem[]>(DEMO_SOURCE_FILES);
  const [activeSubTab, setActiveSubTab] = useState<'package' | 'lockfile' | 'code'>('code');

  const handleUpdateCode = (newContent: string) => {
    const updated = [...sourceFiles];
    updated[activeCodeFileIdx] = {
      ...updated[activeCodeFileIdx],
      content: newContent
    };
    setSourceFiles(updated);
  };

  const handleResetToDemo = () => {
    setProjectName('cloud-nexus-api (Demo)');
    setPackageJson(DEMO_PACKAGE_JSON);
    setLockfile(DEMO_PACKAGE_LOCK_JSON);
    setSourceFiles(DEMO_SOURCE_FILES);
    setActiveCodeFileIdx(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onExecuteScan({
      projectName,
      packageJson,
      lockfile,
      sourceFiles,
      enableLiveOSV
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <UploadCloud className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-white">
              Repository Scanner & AST Code Editor
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              Live AST Analysis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Test any project by modifying <code className="text-emerald-400">package.json</code>, lockfile constraints, or editing JavaScript/TypeScript source code to observe how the AST reachability engine responds in real-time.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleResetToDemo}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Code</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isScanning}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>{isScanning ? 'Analyzing AST...' : 'Run Pipeline Scan'}</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        {/* Sub-tab navigation */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveSubTab('code')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeSubTab === 'code'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Source Files ({sourceFiles.length})
            </button>
            <button
              onClick={() => setActiveSubTab('package')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeSubTab === 'package'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              package.json
            </button>
            <button
              onClick={() => setActiveSubTab('lockfile')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeSubTab === 'lockfile'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              package-lock.json
            </button>
          </div>

          {activeSubTab === 'code' && (
            <div className="flex items-center space-x-1 overflow-x-auto">
              {sourceFiles.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setActiveCodeFileIdx(idx)}
                  className={`text-[11px] px-2.5 py-1 rounded font-mono transition cursor-pointer ${
                    activeCodeFileIdx === idx
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {file.path.split('/').pop()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Textarea Workspace */}
        <div className="p-4 bg-slate-950 font-mono text-xs">
          {activeSubTab === 'code' && (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>File: {sourceFiles[activeCodeFileIdx]?.path}</span>
                <span className="text-emerald-400 font-sans">
                  💡 Tip: Notice `jwt.verify()` call site vs safe methods in `httpClient.ts`!
                </span>
              </div>
              <textarea
                value={sourceFiles[activeCodeFileIdx]?.content || ''}
                onChange={e => handleUpdateCode(e.target.value)}
                rows={16}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

          {activeSubTab === 'package' && (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-500">
                Direct dependencies and version declarations:
              </div>
              <textarea
                value={packageJson}
                onChange={e => setPackageJson(e.target.value)}
                rows={16}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

          {activeSubTab === 'lockfile' && (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-500">
                Resolved package tree & integrity hashes (npm-lock-v3):
              </div>
              <textarea
                value={lockfile}
                onChange={e => setLockfile(e.target.value)}
                rows={16}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
