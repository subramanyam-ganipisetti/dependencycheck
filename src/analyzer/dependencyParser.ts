import semver from 'semver';
import { DependencyInfo } from '../types';

export interface ParseResult {
  projectName: string;
  version: string;
  dependencies: DependencyInfo[];
  directDependenciesCount: number;
  transitiveDependenciesCount: number;
  rawLockfileType: 'npm-lock-v1' | 'npm-lock-v2' | 'npm-lock-v3' | 'package-json-only' | 'yarn-lock' | 'requirements-txt' | 'unknown';
}

/**
 * Safely parses JSON by trying standard JSON.parse first,
 * and only applying trailing-comma / comment cleanup if direct parse fails.
 * Preserves URLs (like https://registry.npmjs.org/) without stripping slashes.
 */
function safeParseJson(str: string): any {
  if (!str || str.trim().length === 0) return null;
  try {
    return JSON.parse(str);
  } catch {
    // Only clean if direct JSON.parse failed
    try {
      const noTrailingCommas = str.replace(/,(\s*[}\]])/g, '$1');
      return JSON.parse(noTrailingCommas);
    } catch {
      try {
        const noComments = str
          .replace(/(?:^|\s)\/\/[^\r\n]*/g, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/,(\s*[}\]])/g, '$1');
        return JSON.parse(noComments);
      } catch {
        return null;
      }
    }
  }
}

/**
 * Parses Python requirements.txt format (e.g. requests==2.25.1, flask>=1.1.2)
 */
function parseRequirementsTxt(content: string): ParseResult {
  const dependencies: DependencyInfo[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-r') || trimmed.startsWith('-i')) continue;

    // Match name and version specifier
    const match = trimmed.match(/^([a-zA-Z0-9_.-]+)\s*(?:==|>=|<=|~=|>|<)?\s*([0-9a-zA-Z_.-]+)?/);
    if (match) {
      const name = match[1].toLowerCase();
      const rawVer = match[2] || '1.0.0';
      const cleanVer = semver.coerce(rawVer)?.version || rawVer;

      dependencies.push({
        name,
        installedVersion: cleanVer,
        requestedRange: rawVer,
        isDirect: true,
        dependencyType: 'production'
      });
    }
  }

  return {
    projectName: 'python-project',
    version: '1.0.0',
    dependencies,
    directDependenciesCount: dependencies.length,
    transitiveDependenciesCount: 0,
    rawLockfileType: 'requirements-txt'
  };
}

/**
 * Parses package.json and package-lock.json into normalized dependency graphs.
 * Resilient against relaxed JSON, comments, trailing commas, and Python requirements.txt.
 */
export function parseDependencies(
  packageJsonStr: string,
  lockfileStr?: string
): ParseResult {
  // Check if content is Python requirements.txt
  if (
    packageJsonStr &&
    !packageJsonStr.trim().startsWith('{') &&
    (packageJsonStr.includes('==') || packageJsonStr.includes('>=') || packageJsonStr.includes('requirements') || packageJsonStr.includes('flask') || packageJsonStr.includes('requests') || packageJsonStr.includes('django'))
  ) {
    return parseRequirementsTxt(packageJsonStr);
  }

  let pkgJson: any = {};
  if (packageJsonStr && packageJsonStr.trim().length > 0) {
    pkgJson = safeParseJson(packageJsonStr);
    if (!pkgJson) {
      try {
        // Fallback: regex extraction of package dependencies if JSON is malformed
        pkgJson = { dependencies: {}, devDependencies: {} };
        const depRegex = /"([@a-zA-Z0-9_\-\.\/]+)"\s*:\s*"([^"]+)"/g;
        let match;
        while ((match = depRegex.exec(packageJsonStr)) !== null) {
          const key = match[1];
          const val = match[2];
          if (!['name', 'version', 'description', 'main', 'scripts', 'author', 'license'].includes(key)) {
            pkgJson.dependencies[key] = val;
          }
        }
      } catch {
        pkgJson = {};
      }
    }
  }

  const projectName = pkgJson?.name || 'unnamed-project';
  const projectVersion = pkgJson?.version || '1.0.0';

  const directDepsMap = new Map<string, { type: 'production' | 'dev' | 'peer' | 'optional'; range: string }>();

  if (pkgJson?.dependencies) {
    for (const [name, range] of Object.entries(pkgJson.dependencies)) {
      directDepsMap.set(name, { type: 'production', range: String(range) });
    }
  }
  if (pkgJson?.devDependencies) {
    for (const [name, range] of Object.entries(pkgJson.devDependencies)) {
      directDepsMap.set(name, { type: 'dev', range: String(range) });
    }
  }
  if (pkgJson?.peerDependencies) {
    for (const [name, range] of Object.entries(pkgJson.peerDependencies)) {
      directDepsMap.set(name, { type: 'peer', range: String(range) });
    }
  }
  if (pkgJson?.optionalDependencies) {
    for (const [name, range] of Object.entries(pkgJson.optionalDependencies)) {
      directDepsMap.set(name, { type: 'optional', range: String(range) });
    }
  }

  const dependenciesMap = new Map<string, DependencyInfo>();
  let lockType: ParseResult['rawLockfileType'] = 'package-json-only';

  if (lockfileStr && lockfileStr.trim().length > 0) {
    try {
      const lockObj = safeParseJson(lockfileStr);
      if (lockObj) {
        if (lockObj.lockfileVersion === 3 || lockObj.lockfileVersion === 2) {
          lockType = lockObj.lockfileVersion === 3 ? 'npm-lock-v3' : 'npm-lock-v2';
          if (lockObj.packages) {
            for (const [pkgPath, meta] of Object.entries<any>(lockObj.packages)) {
              if (!pkgPath || pkgPath === '') continue;
              const parts = pkgPath.split('node_modules/');
              const name = parts[parts.length - 1];
              if (!name) continue;

              const isDirect = directDepsMap.has(name) && parts.length === 2;
              const directInfo = directDepsMap.get(name);
              const depType = directInfo?.type || (meta.dev ? 'dev' : 'production');
              const cleanVersion = semver.clean(meta.version) || semver.coerce(meta.version)?.version || meta.version || '0.0.0';

              dependenciesMap.set(`${name}@${cleanVersion}`, {
                name,
                installedVersion: cleanVersion,
                requestedRange: directInfo?.range,
                isDirect,
                dependencyType: depType,
                resolvedUrl: meta.resolved,
                integrity: meta.integrity,
                parentPath: parts.slice(1, -1),
                dependencies: meta.dependencies
              });
            }
          }
        } else if (lockObj.lockfileVersion === 1 || lockObj.dependencies) {
          lockType = 'npm-lock-v1';
          function parseV1Deps(depsObj: Record<string, any>, parentList: string[] = []) {
            for (const [name, meta] of Object.entries<any>(depsObj)) {
              const isDirect = directDepsMap.has(name) && parentList.length === 0;
              const directInfo = directDepsMap.get(name);
              const cleanVersion = semver.clean(meta.version) || semver.coerce(meta.version)?.version || meta.version || '0.0.0';

              dependenciesMap.set(`${name}@${cleanVersion}`, {
                name,
                installedVersion: cleanVersion,
                requestedRange: directInfo?.range,
                isDirect,
                dependencyType: directInfo?.type || (meta.dev ? 'dev' : 'production'),
                resolvedUrl: meta.resolved,
                integrity: meta.integrity,
                parentPath: parentList,
                dependencies: meta.requires
              });

              if (meta.dependencies) {
                parseV1Deps(meta.dependencies, [...parentList, name]);
              }
            }
          }
          parseV1Deps(lockObj.dependencies);
        }
      }
    } catch {
      lockType = 'unknown';
    }
  }

  // Populate direct dependencies if no lockfile entries parsed
  if (dependenciesMap.size === 0) {
    for (const [name, directInfo] of directDepsMap.entries()) {
      const coerced = semver.coerce(directInfo.range)?.version || '1.0.0';
      dependenciesMap.set(name, {
        name,
        installedVersion: coerced,
        requestedRange: directInfo.range,
        isDirect: true,
        dependencyType: directInfo.type
      });
    }
  }

  const allDeps = Array.from(dependenciesMap.values());
  const directCount = allDeps.filter(d => d.isDirect).length;
  const transitiveCount = allDeps.length - directCount;

  return {
    projectName,
    version: projectVersion,
    dependencies: allDeps,
    directDependenciesCount: directCount,
    transitiveDependenciesCount: transitiveCount,
    rawLockfileType: lockType
  };
}
