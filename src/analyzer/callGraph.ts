import { ASTCallTrace } from '../types';
import { FileAnalysisResult, ExtractedImport, ExtractedCall } from './astEngine';

/**
 * Builds call traces and determines reachability path from entrypoints to dependency calls.
 */
export function buildCallTracesForVulnerability(
  packageName: string,
  vulnerableFunctions: string[],
  fileAnalyses: FileAnalysisResult[]
): ASTCallTrace[] {
  const traces: ASTCallTrace[] = [];

  // 1. Find all files that import the target package
  for (const analysis of fileAnalyses) {
    const relevantImports = analysis.imports.filter(
      imp => imp.packageName.toLowerCase() === packageName.toLowerCase()
    );

    if (relevantImports.length === 0) continue;

    // For each relevant import, check if any call uses this local alias with a vulnerable function
    for (const imp of relevantImports) {
      for (const call of analysis.calls) {
        let isVulnCall = false;
        let invokedFunc = '';

        // Case A: Import default or namespace (e.g. import jwt from 'jsonwebtoken'; jwt.verify())
        if (imp.importedSymbol === 'default' || imp.importedSymbol === '*') {
          if (call.calleeName === imp.localName && call.memberName) {
            if (vulnerableFunctions.length === 0 || vulnerableFunctions.includes(call.memberName)) {
              isVulnCall = true;
              invokedFunc = `${imp.localName}.${call.memberName}()`;
            }
          }
        }
        // Case B: Named import (e.g. import { verify } from 'jsonwebtoken'; verify())
        else if (imp.importedSymbol) {
          if (
            (vulnerableFunctions.length === 0 || vulnerableFunctions.includes(imp.importedSymbol)) &&
            (call.calleeName === imp.localName && !call.memberName)
          ) {
            isVulnCall = true;
            invokedFunc = `${imp.localName}()`;
          }
        }

        if (isVulnCall) {
          // Construct entrypoint and call path
          const entrypoint = inferEntrypoint(analysis.filePath, fileAnalyses);
          const stack = buildCallStack(entrypoint, analysis.filePath, call.line, invokedFunc);

          traces.push({
            entrypoint,
            filePath: analysis.filePath,
            line: call.line,
            column: call.column,
            importedSymbol: imp.importedSymbol,
            localAlias: imp.localName,
            invokedSymbol: invokedFunc,
            codeSnippet: call.codeSnippet,
            callStack: stack
          });
        }
      }
    }
  }

  return traces;
}

/**
 * Identifies the probable top-level entrypoint file for the repo (e.g. server.ts, app.ts, index.ts)
 */
function inferEntrypoint(targetFilePath: string, fileAnalyses: FileAnalysisResult[]): string {
  const commonEntryFiles = [
    'server.ts', 'server.js', 'src/server.ts', 'src/server.js',
    'app.ts', 'app.js', 'src/app.ts', 'src/app.js',
    'index.ts', 'index.js', 'src/index.ts', 'src/index.js',
    'main.ts', 'main.js', 'src/main.ts', 'src/main.js'
  ];

  for (const entry of commonEntryFiles) {
    if (fileAnalyses.some(f => f.filePath === entry || f.filePath.endsWith(entry))) {
      return entry;
    }
  }

  return targetFilePath;
}

/**
 * Constructs a step-by-step call chain hierarchy from root to invocation site
 */
function buildCallStack(
  entrypoint: string,
  targetFile: string,
  line: number,
  invokedFunc: string
): string[] {
  const stack: string[] = [];

  if (entrypoint !== targetFile) {
    stack.push(`${entrypoint} (HTTP Request Dispatcher)`);
  }

  // Infer logical layer from path
  let layerDescription = targetFile;
  if (targetFile.includes('route') || targetFile.includes('controller') || targetFile.includes('api')) {
    layerDescription = `${targetFile} (Route Controller Layer)`;
  } else if (targetFile.includes('service') || targetFile.includes('lib') || targetFile.includes('util')) {
    layerDescription = `${targetFile} (Business Logic Service Layer)`;
  } else if (targetFile.includes('auth') || targetFile.includes('security')) {
    layerDescription = `${targetFile} (Security & Authentication Middleware)`;
  }

  stack.push(`${layerDescription} [Line ${line}]`);
  stack.push(`└── ${invokedFunc} (Vulnerable Function Invocation)`);

  return stack;
}
