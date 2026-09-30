import semver from 'semver';
import { BreakingChangeAnalysis, BreakingRiskLevel } from '../types';

interface KnownBreakingMetadata {
  majorChanges: string[];
  removedExports: string[];
  signatureChanges: string[];
  migrationNotes: string;
}

const KNOWN_BREAKING_CHANGES: Record<string, Record<string, KnownBreakingMetadata>> = {
  redis: {
    '4.0.0': {
      majorChanges: [
        'Complete architectural rewrite from legacy Node callback-style API to native async/await Promises.',
        'Legacy createClient().on("message") replaced with client.subscribe().',
        'Command arguments now strictly type-checked.'
      ],
      removedExports: ['RedisClient.prototype.send_command callback overload'],
      signatureChanges: ['client.connect() must be explicitly awaited before sending commands'],
      migrationNotes: 'https://github.com/redis/node-redis/blob/master/docs/v3-to-v4.md'
    }
  },
  jsonwebtoken: {
    '9.0.0': {
      majorChanges: [
        'Strict key type enforcement: secretOrPublicKey must now be a KeyObject or valid string/Buffer.',
        'Custom objects with toString() getters are rejected to prevent prototype/getter code execution.',
        'Dropped support for insecure algorithm None.'
      ],
      removedExports: [],
      signatureChanges: ['jwt.verify() option maxAge and algorithms strictly validated'],
      migrationNotes: 'https://github.com/auth0/node-jsonwebtoken/releases/tag/v9.0.0'
    }
  },
  axios: {
    '1.0.0': {
      majorChanges: [
        'Removed Axios.prototype.create cancel token legacy methods.',
        'Strict TypeScript definitions for AxiosResponse and AxiosError data.',
        'Native Fetch adapter compatibility introduced.'
      ],
      removedExports: ['axios.Cancel', 'axios.CancelToken'],
      signatureChanges: ['AbortController signal now primary cancellation mechanism'],
      migrationNotes: 'https://github.com/axios/axios/releases/tag/v1.0.0'
    }
  }
};

/**
 * Analyzes potential breaking changes between the currently installed version and the candidate fixed version.
 */
export function analyzeBreakingChange(
  packageName: string,
  currentVersion: string,
  targetVersion: string
): BreakingChangeAnalysis {
  const cleanCurrent = semver.clean(currentVersion) || semver.coerce(currentVersion)?.version || '1.0.0';
  const cleanTarget = semver.clean(targetVersion) || semver.coerce(targetVersion)?.version || '1.0.1';

  let diffType: 'patch' | 'minor' | 'major' | 'unknown' = 'unknown';
  try {
    const rawDiff = semver.diff(cleanCurrent, cleanTarget);
    if (rawDiff === 'major' || rawDiff === 'premajor') diffType = 'major';
    else if (rawDiff === 'minor' || rawDiff === 'preminor') diffType = 'minor';
    else if (rawDiff === 'patch' || rawDiff === 'prepatch' || rawDiff === 'prerelease') diffType = 'patch';
  } catch {
    diffType = 'unknown';
  }

  let riskLevel: BreakingRiskLevel = 'SAFE';
  const breakingReasons: string[] = [];
  const removedExports: string[] = [];
  const signatureChanges: string[] = [];
  let migrationNotes = '';

  const knownMeta = KNOWN_BREAKING_CHANGES[packageName.toLowerCase()];

  if (diffType === 'major') {
    riskLevel = 'HIGH RISK';
    breakingReasons.push(`Major semver leap (${cleanCurrent} -> ${cleanTarget}). Public API contracts, module exports, or runtime behavioral defaults may break existing callers.`);

    if (knownMeta) {
      for (const [ver, meta] of Object.entries(knownMeta)) {
        if (semver.gte(cleanTarget, ver) && semver.lt(cleanCurrent, ver)) {
          breakingReasons.push(...meta.majorChanges);
          removedExports.push(...meta.removedExports);
          signatureChanges.push(...meta.signatureChanges);
          migrationNotes = meta.migrationNotes;
        }
      }
    }
  } else if (diffType === 'minor') {
    riskLevel = 'LOW RISK';
    breakingReasons.push(`Minor semver bump (${cleanCurrent} -> ${cleanTarget}). Backward-compatible functionality added according to SemVer 2.0.`);
  } else if (diffType === 'patch') {
    riskLevel = 'SAFE';
    breakingReasons.push(`Patch upgrade (${cleanCurrent} -> ${cleanTarget}). Backward-compatible bug/security fix with identical public API surface.`);
  } else {
    riskLevel = 'UNKNOWN';
    breakingReasons.push('Version delta could not be strictly resolved against semver specification.');
  }

  return {
    packageName,
    currentVersion: cleanCurrent,
    targetVersion: cleanTarget,
    semverJump: diffType,
    riskLevel,
    breakingReasons,
    removedExports,
    signatureChanges,
    migrationNotes: migrationNotes || undefined
  };
}
