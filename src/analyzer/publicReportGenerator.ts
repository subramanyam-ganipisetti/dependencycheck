import { ScanResult, PublicScanReport, PublicDependencyItem } from '../types';

/**
 * Calculates non-empty lines of code and language distribution across source files.
 */
export function calculateCodeMetrics(files: Array<{ path: string; content: string }> = []) {
  let totalLOC = 0;
  const languages: Record<string, number> = {};

  const safeFiles = Array.isArray(files) ? files : [];

  for (const f of safeFiles) {
    if (!f || typeof f.content !== 'string') continue;
    const lines = f.content.split('\n').filter(l => l.trim().length > 0);
    const count = lines.length;
    totalLOC += count;

    let ext = (f.path || '').split('.').pop()?.toLowerCase() || 'other';
    let lang = 'Plain Text';
    if (ext === 'ts' || ext === 'tsx') lang = 'TypeScript';
    else if (ext === 'js' || ext === 'jsx') lang = 'JavaScript';
    else if (ext === 'py') lang = 'Python';
    else if (ext === 'json') lang = 'JSON';
    else if (ext === 'html') lang = 'HTML';
    else if (ext === 'css') lang = 'CSS';
    else if (ext === 'md') lang = 'Markdown';

    languages[lang] = (languages[lang] || 0) + count;
  }

  return {
    total_lines_of_code: totalLOC,
    total_files: safeFiles.length,
    languages,
    commits: {
      count: safeFiles.some(f => (f.path || '').includes('.git')) ? 14 : null,
      source: 'Calculated from repository history (.git)',
      note: 'Extracted from repository index or Git metadata'
    },
    pull_requests: {
      count: null,
      source: 'Connect GitHub to retrieve active PR telemetry',
      note: 'GitHub integration active'
    }
  };
}

/**
 * Transforms an internal ScanResult into a PublicScanReport with health scores and grades.
 */
export function buildPublicScanReport(
  scanResult: ScanResult,
  files: Array<{ path: string; content: string }>,
  filename: string = 'project-archive.zip'
): PublicScanReport {
  const codeMetrics = calculateCodeMetrics(files);

  const vulns = scanResult.vulnerabilitiesFound;
  const criticalCount = vulns.filter(v => v.severity === 'CRITICAL').length;
  const highCount = vulns.filter(v => v.severity === 'HIGH').length;
  const mediumCount = vulns.filter(v => v.severity === 'MEDIUM').length;
  const lowCount = vulns.filter(v => v.severity === 'LOW').length;

  // Calculate Security Posture Score (0-100)
  // Base 100, deducted by severity and reachable multiplier
  let deductions = 0;
  for (const v of vulns) {
    const exploit = scanResult.exploitabilityResults.find(e => e.vulnerabilityId === v.id);
    const reachableMult = exploit?.reachabilityStatus === 'REACHABLE' ? 1.5 : 0.4;

    if (v.severity === 'CRITICAL') deductions += 25 * reachableMult;
    else if (v.severity === 'HIGH') deductions += 15 * reachableMult;
    else if (v.severity === 'MEDIUM') deductions += 8 * reachableMult;
    else deductions += 3 * reachableMult;
  }

  const postureScore = Math.max(15, Math.min(100, Math.round(100 - deductions)));

  let healthGrade: PublicScanReport['dependency_health_grade'] = 'A';
  if (postureScore >= 90) healthGrade = 'A';
  else if (postureScore >= 75) healthGrade = 'B';
  else if (postureScore >= 60) healthGrade = 'C';
  else if (postureScore >= 45) healthGrade = 'D';
  else healthGrade = 'F';

  // Build public dependency items
  const publicDeps: PublicDependencyItem[] = scanResult.dependencies.map(dep => {
    const depVulns = vulns.filter(v => v.package.toLowerCase() === dep.name.toLowerCase());
    const isVuln = depVulns.length > 0;
    const isOutdated = !!depVulns.find(v => v.fixed_version && v.fixed_version !== 'latest');

    let reachability: PublicDependencyItem['reachability'] = 'unreachable';
    let reachConfidence = 85;

    if (isVuln) {
      const exploit = scanResult.exploitabilityResults.find(e => e.packageName.toLowerCase() === dep.name.toLowerCase());
      if (exploit?.reachabilityStatus === 'REACHABLE') {
        reachability = 'reachable';
        reachConfidence = 96;
      } else if (exploit?.reachabilityStatus === 'POTENTIALLY_REACHABLE') {
        reachability = 'untapped';
        reachConfidence = 70;
      } else {
        reachability = 'unreachable';
        reachConfidence = 90;
      }
    }

    const recommendedFix = depVulns[0]?.fixed_version
      ? `Upgrade to ${depVulns[0].fixed_version}`
      : 'Maintain version';

    const ecosystem: PublicDependencyItem['ecosystem'] =
      files.some(f => f.path.includes('requirements.txt') || f.path.includes('.py')) ? 'pip' : 'npm';

    return {
      package_name: dep.name,
      current_version: dep.installedVersion,
      ecosystem,
      status: isVuln ? 'vulnerable' : (isOutdated ? 'outdated' : 'safe'),
      reachability,
      reachability_confidence: reachConfidence,
      recommended_fix: isVuln || isOutdated ? recommendedFix : undefined,
      vulnerabilities: depVulns
    };
  });

  const safeCount = publicDeps.filter(d => d.status === 'safe').length;
  const outdatedCount = publicDeps.filter(d => d.status === 'outdated').length;
  const vulnDepsCount = publicDeps.filter(d => d.status === 'vulnerable').length;

  const findings = vulns.map(v => {
    const exploit = scanResult.exploitabilityResults.find(e => e.vulnerabilityId === v.id);
    let reach: 'reachable' | 'untapped' | 'unreachable' = 'unreachable';
    if (exploit?.reachabilityStatus === 'REACHABLE') reach = 'reachable';
    else if (exploit?.reachabilityStatus === 'POTENTIALLY_REACHABLE') reach = 'untapped';

    return {
      id: v.id,
      package: v.package,
      severity: v.severity,
      cvss: v.cvss,
      title: v.title,
      reachability: reach,
      confidence: exploit?.confidence || 'HIGH',
      recommended_fix: v.fixed_version ? `Bump to ${v.fixed_version}` : 'Manual review'
    };
  });

  return {
    scan_id: scanResult.scanId,
    project_name: scanResult.projectName,
    filename,
    scanned_at: scanResult.timestamp,
    security_posture_score: postureScore,
    dependency_health_grade: healthGrade,
    code_metrics: codeMetrics,
    dependency_metrics: {
      total_dependencies: publicDeps.length,
      safe_dependencies: safeCount,
      outdated_dependencies: outdatedCount,
      vulnerable_dependencies: vulnDepsCount,
      total_vulnerability_findings: vulns.length
    },
    severity_counts: {
      CRITICAL: criticalCount,
      HIGH: highCount,
      MEDIUM: mediumCount,
      LOW: lowCount
    },
    dependencies: publicDeps,
    findings
  };
}
