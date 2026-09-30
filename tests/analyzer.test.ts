import { parseDependencies } from '../src/analyzer/dependencyParser';
import { matchVulnerabilities } from '../src/analyzer/vulnerabilityEngine';
import { analyzeSourceFile } from '../src/analyzer/astEngine';
import { evaluateExploitability } from '../src/analyzer/exploitabilityEngine';
import { analyzeBreakingChange } from '../src/analyzer/breakingChangeEngine';
import {
  calculateTriageEvaluation,
  buildPatchCandidates,
  groupPatchesForPROptimization
} from '../src/analyzer/patchOptimizer';
import { generatePRArtifact } from '../src/analyzer/prGenerator';
import {
  DEMO_PACKAGE_JSON,
  DEMO_PACKAGE_LOCK_JSON,
  DEMO_SOURCE_FILES
} from '../src/demo/demoRepository';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

export async function runAllTests() {
  console.log('\n--- [TEST SUITE] DependencyCheck Automated Verification ---');

  // Test 1: Lockfile & Package.json Parsing
  console.log('\n1. Lockfile & Dependency Parser:');
  const parseRes = parseDependencies(DEMO_PACKAGE_JSON, DEMO_PACKAGE_LOCK_JSON);
  assert(parseRes.dependencies.length >= 7, 'Extracts all lockfile dependencies');
  assert(parseRes.directDependenciesCount === 7, 'Identifies direct dependencies correctly');
  assert(parseRes.rawLockfileType === 'npm-lock-v3', 'Recognizes npm-lock-v3 specification');

  // Test 2: Vulnerability Matching
  console.log('\n2. Vulnerability Matching:');
  const vulns = await matchVulnerabilities(parseRes.dependencies, { enableLiveOSV: false });
  assert(vulns.length >= 4, 'Correlates vulnerable dependencies from curated advisory dataset');
  const hasJwt = vulns.some(v => v.package === 'jsonwebtoken' && v.id === 'CVE-2022-23529');
  assert(hasJwt, 'Matches CVE-2022-23529 to jsonwebtoken');

  // Test 3: AST Engine Code Parsing
  console.log('\n3. AST Analysis Engine:');
  const authCode = DEMO_SOURCE_FILES.find(f => f.path === 'src/routes/auth.ts')!.content;
  const authAst = analyzeSourceFile('src/routes/auth.ts', authCode);
  const jwtImport = authAst.imports.find(i => i.packageName === 'jsonwebtoken');
  assert(jwtImport !== undefined, 'Extracts ES import for jsonwebtoken');
  const jwtCall = authAst.calls.find(c => c.calleeName === 'jwt' && c.memberName === 'verify');
  assert(jwtCall !== undefined, 'Identifies member call jwt.verify() with AST line number');

  // Test 4: Reachable vs Unreachable Exploitability Check
  console.log('\n4. Exploitability & Reachability Check:');
  const allAnalyses = DEMO_SOURCE_FILES.map(f => analyzeSourceFile(f.path, f.content));
  const jwtVuln = vulns.find(v => v.package === 'jsonwebtoken')!;
  const jwtExploit = evaluateExploitability(jwtVuln, parseRes.dependencies, allAnalyses);
  assert(jwtExploit.reachabilityStatus === 'REACHABLE', 'Flags actively invoked jwt.verify() as REACHABLE');
  assert(jwtExploit.confidence === 'HIGH', 'Assigns HIGH confidence to confirmed call site');

  const axiosVuln = vulns.find(v => v.package === 'axios')!;
  const axiosExploit = evaluateExploitability(axiosVuln, parseRes.dependencies, allAnalyses);
  assert(axiosExploit.reachabilityStatus === 'UNREACHABLE', 'Flags axios without followRedirects as UNREACHABLE');

  // Test 5: Breaking Change Detection
  console.log('\n5. Breaking Change Detection:');
  const redisBreak = analyzeBreakingChange('redis', '3.1.1', '4.0.0');
  assert(redisBreak.riskLevel === 'HIGH RISK', 'Classifies redis 3.x -> 4.x major bump as HIGH RISK');
  assert(redisBreak.removedExports.length > 0 || redisBreak.breakingReasons.length > 0, 'Details breaking API rewrite notes');

  const lodashBreak = analyzeBreakingChange('lodash', '4.17.15', '4.17.21');
  assert(lodashBreak.riskLevel === 'SAFE', 'Classifies lodash 4.17.15 -> 4.17.21 patch upgrade as SAFE');

  // Test 6: Intelligent Triage Scoring
  console.log('\n6. Intelligent Triage Scoring:');
  const jwtTriage = calculateTriageEvaluation(jwtVuln, jwtExploit, analyzeBreakingChange('jsonwebtoken', '8.5.1', '9.0.0'));
  assert(jwtTriage.compositeRiskScore >= 70, 'Reachable high severity vuln scores >= 70 composite risk');

  // Test 7: Grouping & ≥60% PR Reduction Target
  console.log('\n7. Grouping Engine & PR Reduction Target:');
  const allExploits = vulns.map(v => evaluateExploitability(v, parseRes.dependencies, allAnalyses));
  const breakingList = vulns.map(v => {
    const dep = parseRes.dependencies.find(d => d.name === v.package);
    return analyzeBreakingChange(v.package, dep?.installedVersion || '1.0.0', v.fixed_version);
  });
  const triageList = vulns.map((v, i) => calculateTriageEvaluation(v, allExploits[i], breakingList[i]));
  const candidates = buildPatchCandidates(vulns, allExploits, breakingList, triageList);
  const grouped = groupPatchesForPROptimization(candidates);
  
  assert(grouped.reductionPercentage >= 60, `Achieves >=60% PR volume reduction (Achieved: ${grouped.reductionPercentage}%)`);
  assert(grouped.groups.length < grouped.originalPRCount, 'Consolidates safe upgrades into fewer PRs');

  // Test 8: PR Generator
  console.log('\n8. Automated PR Generator:');
  const prArtifact = generatePRArtifact(grouped.groups[0], [jwtExploit, axiosExploit], 'cloud-nexus-api');
  assert(prArtifact.branchName.startsWith('security/'), 'Generates valid git branch name');
  assert(prArtifact.prBodyMarkdown.includes('Deterministic Sandbox'), 'PR body contains sandbox validation section');
  assert(prArtifact.gitCommands.length >= 4, 'Outputs runnable Git command list');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log(`========================================\n`);

  return { passed: passedTests, total: totalTests };
}

// If run directly via node/tsx
if (process.argv[1]?.endsWith('analyzer.test.ts')) {
  runAllTests().then(res => {
    process.exit(res.passed === res.total ? 0 : 1);
  });
}
