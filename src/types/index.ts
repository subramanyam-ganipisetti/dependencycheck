export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type TabKey =
  | 'overview'
  | 'exploitability'
  | 'vulnerabilities'
  | 'breaking'
  | 'patch-groups'
  | 'pr-generator'
  | 'sandbox'
  | 'custom-scan'
  | 'architecture';

export type ExploitabilityConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type ReachabilityStatus = 'REACHABLE' | 'POTENTIALLY_REACHABLE' | 'UNREACHABLE' | 'UNKNOWN';

export type BreakingRiskLevel = 'SAFE' | 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' | 'UNKNOWN';

export type TriageAction = 
  | 'PATCH NOW' 
  | 'PATCH SAFELY' 
  | 'PATCH WITH REVIEW' 
  | 'DEFER — NOT REACHABLE' 
  | 'MANUAL INVESTIGATION REQUIRED';

export interface VulnerabilityAdvisory {
  id: string; // e.g. CVE-2023-26136, GHSA-xxxx-yyyy
  package: string;
  affected_versions: string; // semver range, e.g. "< 4.17.21"
  fixed_version: string; // e.g. "4.17.21"
  severity: SeverityLevel;
  cvss: number;
  cwe?: string;
  title: string;
  description: string;
  references: string[];
  source: 'OSV.dev' | 'GitHub Advisory' | 'NVD' | 'Curated Local Database';
  vulnerable_functions?: string[]; // Specific function or API symbols identified as vulnerable
  isMockOrCurated?: boolean;
}

export interface DependencyInfo {
  name: string;
  installedVersion: string;
  requestedRange?: string;
  isDirect: boolean;
  dependencyType: 'production' | 'dev' | 'peer' | 'optional';
  resolvedUrl?: string;
  integrity?: string;
  parentPath?: string[]; // Call tree or dependency path from root
  dependencies?: Record<string, string>;
}

export interface ASTCallTrace {
  entrypoint: string;
  filePath: string;
  line: number;
  column: number;
  importedSymbol: string;
  localAlias: string;
  invokedSymbol: string;
  codeSnippet: string;
  callStack: string[]; // e.g. ["server.ts", "routes/auth.ts (verifyToken)", "services/jwt.ts", "jsonwebtoken.verify()"]
}

export interface ExploitabilityResult {
  vulnerabilityId: string;
  packageName: string;
  installedVersion: string;
  vulnerableVersionMatch: boolean;
  vulnerableFunctionsIdentified: string[];
  isImportedInProject: boolean;
  isFunctionInvoked: boolean;
  reachabilityStatus: ReachabilityStatus;
  confidence: ExploitabilityConfidence;
  confidenceReason: string;
  callTraces: ASTCallTrace[];
  limitationsNote: string;
}

export interface BreakingChangeAnalysis {
  packageName: string;
  currentVersion: string;
  targetVersion: string;
  semverJump: 'patch' | 'minor' | 'major' | 'unknown';
  riskLevel: BreakingRiskLevel;
  breakingReasons: string[];
  removedExports: string[];
  signatureChanges: string[];
  migrationNotes?: string;
}

export interface TriageEvaluation {
  vulnerabilityId: string;
  packageName: string;
  severity: SeverityLevel;
  cvss: number;
  reachability: ReachabilityStatus;
  exploitabilityConfidence: ExploitabilityConfidence;
  breakingRisk: BreakingRiskLevel;
  compositeRiskScore: number; // 0 to 100
  recommendedAction: TriageAction;
  actionReason: string;
  priorityOrder: number;
}

export interface PatchCandidate {
  packageName: string;
  currentVersion: string;
  targetVersion: string;
  vulnerabilitiesFixed: string[];
  maxSeverity: SeverityLevel;
  isReachable: boolean;
  breakingRisk: BreakingRiskLevel;
  recommendedAction: TriageAction;
}

export interface PatchGroup {
  id: string;
  title: string;
  description: string;
  groupType: 'SAFE_AUTOMATED' | 'HIGH_RISK_MANUAL_REVIEW' | 'DEFERRED_UNREACHABLE';
  patches: PatchCandidate[];
  overallRisk: BreakingRiskLevel;
  compatibilityVerified: boolean;
  validationStatus: 'PENDING' | 'VALIDATING' | 'PASSED' | 'FAILED' | 'SKIPPED';
  reductionCount: {
    individualPRsCount: number;
    consolidatedPRsCount: number;
  };
}

export interface SandboxValidationReport {
  id: string;
  timestamp: string;
  targetGroup: string;
  stages: {
    name: 'workspace_setup' | 'lockfile_update' | 'npm_ci_deterministic' | 'test_execution' | 'build_lint' | 'diff_verification' | 'sandbox_cleanup';
    status: 'passed' | 'failed' | 'skipped' | 'running';
    durationMs: number;
    outputLog: string;
  }[];
  deterministicMetrics: {
    nodeVersion: string;
    npmVersion: string;
    lockfileHashBefore: string;
    lockfileHashAfter: string;
    dependencyTreeHash: string;
    isReproducible: boolean;
  };
  durationMs: number;
  overallSuccess: boolean;
}

export interface GeneratedPRArtifact {
  branchName: string;
  commitMessage: string;
  prTitle: string;
  prBodyMarkdown: string;
  diffSummary: {
    filesChanged: number;
    insertions: number;
    deletions: number;
    updatedPackages: { name: string; from: string; to: string }[];
  };
  dryRunMode: boolean;
  gitCommands: string[];
}

export interface ScanResult {
  scanId: string;
  timestamp: string;
  projectName: string;
  totalDependencies: number;
  directDependenciesCount: number;
  transitiveDependenciesCount: number;
  dependencies: DependencyInfo[];
  vulnerabilitiesFound: VulnerabilityAdvisory[];
  exploitabilityResults: ExploitabilityResult[];
  breakingChanges: BreakingChangeAnalysis[];
  triageEvaluations: TriageEvaluation[];
  patchCandidates: PatchCandidate[];
  patchGroups: PatchGroup[];
  validationReport?: SandboxValidationReport;
  generatedPRs: GeneratedPRArtifact[];
  metrics: {
    detectionAccuracy: number; // e.g. 96.5%
    originalPRVolume: number;
    optimizedPRVolume: number;
    prReductionPercentage: number; // e.g. 66.7%
    triageDurationSeconds: number; // e.g. 1.8s
    reachableCount: number;
    unreachableCount: number;
    safePatchesCount: number;
    breakingChangeRiskCount: number;
  };
}

export interface FileInputItem {
  path: string;
  content: string;
}

export interface PublicDependencyItem {
  package_name: string;
  current_version: string;
  ecosystem: 'npm' | 'pip' | 'unknown';
  status: 'safe' | 'outdated' | 'vulnerable';
  reachability: 'reachable' | 'untapped' | 'unreachable';
  reachability_confidence?: number;
  recommended_fix?: string;
  vulnerabilities?: VulnerabilityAdvisory[];
}

export interface PublicScanReport {
  scan_id: string;
  project_name: string;
  filename: string;
  scanned_at: string;
  security_posture_score: number;
  dependency_health_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  code_metrics: {
    total_lines_of_code: number;
    total_files: number;
    languages: Record<string, number>;
    commits: {
      count: number | null;
      source: string;
      note: string;
    };
    pull_requests: {
      count: number | null;
      source: string;
      note: string;
    };
  };
  dependency_metrics: {
    total_dependencies: number;
    safe_dependencies: number;
    outdated_dependencies: number;
    vulnerable_dependencies: number;
    total_vulnerability_findings: number;
  };
  severity_counts: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  dependencies: PublicDependencyItem[];
  findings: Array<{
    id: string;
    package: string;
    severity: SeverityLevel;
    cvss: number;
    title: string;
    reachability: 'reachable' | 'untapped' | 'unreachable';
    confidence: ExploitabilityConfidence;
    recommended_fix: string;
  }>;
}

export interface DashboardStats {
  total_repositories: number;
  total_dependencies: number;
  total_vulnerability_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  reachable_count: number;
  unreachable_count: number;
  safe_updates_ready: number;
  overall_posture_score: number;
  overall_health_grade: string;
}

export interface RepositoryItem {
  id: string;
  name: string;
  description: string;
  language: string;
  default_branch: string;
  total_dependencies: number;
  vulnerability_count: number;
  posture_score: number;
  health_grade: string;
  last_scanned: string;
  dependencies?: DependencyInfo[];
  vulnerabilities?: VulnerabilityAdvisory[];
}

export interface UpdateHistoryItem {
  id: string;
  repository_name: string;
  package_name: string;
  from_version: string;
  to_version: string;
  pr_number: number;
  pr_url: string;
  status: 'merged' | 'open' | 'testing' | 'rejected';
  tests_passed: boolean;
  breaking_risk: BreakingRiskLevel;
  created_at: string;
}

export interface TrendsData {
  timeline: Array<{
    date: string;
    vulnerabilities: number;
    posture_score: number;
    reachable_cves: number;
  }>;
  ecosystem_breakdown: Record<string, number>;
  reachability_distribution: {
    reachable: number;
    unreachable: number;
    untapped: number;
  };
}

