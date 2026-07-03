/**
 * Health metrics calculator — takes raw GitHub data and computes scores.
 */

/**
 * Compute stars-related health score (0-100).
 * Factors: total stars, star growth rate, forks ratio.
 */
function starsScore(repo, activity) {
  const stars = repo.stargazers_count || 0;
  const forks = repo.forks_count || 0;
  const forkStarRatio = stars > 0 ? forks / stars : 0;

  let score = 0;

  // Stars tiers (logarithmic)
  if (stars >= 10000) score += 35;
  else if (stars >= 5000) score += 30;
  else if (stars >= 1000) score += 25;
  else if (stars >= 500) score += 20;
  else if (stars >= 100) score += 15;
  else if (stars >= 50) score += 10;
  else if (stars >= 10) score += 5;
  else if (stars > 0) score += 2;

  // Fork-to-star ratio (healthy repos have 0.1-0.5 ratio)
  if (forkStarRatio >= 0.1 && forkStarRatio <= 0.5) score += 10;
  else if (forkStarRatio > 0.5) score += 5;

  // Recent activity bonus
  if (activity.recent > 50) score += 10;
  else if (activity.recent > 20) score += 7;
  else if (activity.recent > 5) score += 5;
  else if (activity.recent > 0) score += 2;

  return Math.min(100, score);
}

/**
 * Compute issue health score (0-100).
 * Factors: issue resolution rate, avg close time, open backlog.
 */
function issuesScore(issueStats) {
  if (!issueStats) return 0;

  const { total, open, closed, avgCloseDays } = issueStats;

  if (total === 0) return 50; // No issues = neutral

  // Resolution rate (closed / total)
  const resolutionRate = total > 0 ? closed / total : 0;
  let score = resolutionRate * 40;

  // Open backlog penalty
  const openRatio = total > 0 ? open / total : 0;
  if (openRatio < 0.1) score += 20;
  else if (openRatio < 0.3) score += 15;
  else if (openRatio < 0.5) score += 10;
  else score += 5;

  // Avg close time
  if (avgCloseDays !== null) {
    if (avgCloseDays < 7) score += 25;
    else if (avgCloseDays < 30) score += 20;
    else if (avgCloseDays < 90) score += 10;
    else score += 3;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Compute commit frequency score (0-100).
 */
function commitFrequencyScore(activity) {
  if (!activity || activity.recent === 0) return 10;

  const days = 90;
  const commitsPerWeek = activity.recent / (days / 7);

  let score;
  if (commitsPerWeek >= 10) score = 30;
  else if (commitsPerWeek >= 5) score = 25;
  else if (commitsPerWeek >= 2) score = 20;
  else if (commitsPerWeek >= 1) score = 15;
  else if (commitsPerWeek >= 0.25) score = 10;
  else score = 5;

  // Bonus for consistent monthly activity
  const months = Object.keys(activity.monthly || {}).length;
  score += Math.min(20, months * 3);

  return Math.min(100, score);
}

/**
 * Compute README quality score (0-100).
 */
function readmeScore(repo) {
  if (!repo.has_wiki) return 0;

  let score = 0;

  // Has README
  if (repo.has_readme) score += 25;
  if (repo.has_downloads) score += 5;
  if (repo.has_projects) score += 5;

  // README content quality
  if (repo.description && repo.description.length > 20) score += 15;
  if (repo.topics && repo.topics.length > 0) score += 10;
  if (repo.homepage) score += 10;
  if (repo.license) score += 10;

  // Size bonus (substantial project)
  if (repo.size > 1000) score += 5;
  else if (repo.size > 100) score += 3;

  // Has issues / PRs (shows engagement)
  if (repo.open_issues_count > 0) score += 5;

  return Math.min(100, score);
}

/**
 * Compute dependency freshness score (0-100).
 * Based on last release date vs current date.
 */
function dependencyFreshnessScore(repo, releases) {
  if (!repo || !releases || releases.length === 0) return 30;

  const latestRelease = releases[0]; // Most recent first
  const lastReleaseDate = new Date(latestRelease.published_at);
  const now = new Date();
  const daysSinceRelease = (now - lastReleaseDate) / (1000 * 60 * 60 * 24);

  let score;
  if (daysSinceRelease <= 30) score = 40;
  else if (daysSinceRelease <= 90) score = 35;
  else if (daysSinceRelease <= 180) score = 25;
  else if (daysSinceRelease <= 365) score = 15;
  else score = 5;

  // Bonus for release frequency
  if (releases.length >= 10) score += 15;
  else if (releases.length >= 5) score += 10;
  else if (releases.length >= 2) score += 5;

  // Has tags (versioning)
  score += 10;

  return Math.min(100, score);
}

/**
 * Compute security score (0-100).
 * Factors: open security advisories, license, dependabot status.
 */
function securityScore(repo, advisories) {
  let score = 100;

  // Deduct for open advisories
  const openAdvisories = (advisories || []).filter((a) => a.state === "draft" || a.state === "open");
  score -= openAdvisories.length * 20;

  // Bonus for having a license
  if (repo.license) score += 10;

  // Bonus for has issues (shows active maintenance)
  if (repo.open_issues_count > 0) score += 5;

  // Penalty for no license
  if (!repo.license) score -= 15;

  // Has security policy
  if (repo.has_security_policy) score += 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Compute contributor diversity score (0-100).
 */
function contributorScore(contributors, repo) {
  if (!contributors || contributors.length === 0) return 20;

  const count = contributors.length;
  let score;

  if (count >= 20) score = 30;
  else if (count >= 10) score = 25;
  else if (count >= 5) score = 20;
  else if (count >= 2) score = 15;
  else score = 10;

  // Top contributor dominance (if top contributor has >80% of commits, less healthy)
  if (contributors.length > 1) {
    const totalCommits = contributors.reduce((s, c) => s + c.contributions, 0);
    const topCommits = contributors[0]?.contributions || 0;
    const dominance = topCommits / totalCommits;
    if (dominance > 0.9) score -= 10;
    else if (dominance > 0.7) score -= 5;
  }

  return Math.max(0, score);
}

/**
 * Compute PR health score (0-100).
 */
function prHealthScore(prStats) {
  if (!prStats || prStats.total === 0) return 30;

  const { open, merged, closed, total } = prStats;
  const mergeRate = total > 0 ? merged / total : 0;
  const openRatio = total > 0 ? open / total : 0;

  let score = mergeRate * 40;

  // Low open backlog is good
  if (openRatio < 0.1) score += 30;
  else if (openRatio < 0.3) score += 20;
  else if (openRatio < 0.5) score += 10;
  else score += 5;

  // Active PRs
  if (open > 0) score += 10;

  // Total PRs (shows collaboration)
  if (total >= 50) score += 15;
  else if (total >= 20) score += 10;
  else if (total >= 5) score += 5;

  return Math.min(100, score);
}

/**
 * Compute composite health score (0-100) with weighted factors.
 */
function computeHealthScore(metrics) {
  const weights = {
    stars: 0.20,
    issues: 0.20,
    commits: 0.15,
    readme: 0.10,
    freshness: 0.10,
    security: 0.10,
    contributors: 0.05,
    prHealth: 0.10,
  };

  let total = 0;
  let weightedTotal = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const score = metrics[key] || 0;
    weightedTotal += score * weight;
    total += weight;
  }

  return Math.round(weightedTotal / total);
}

/**
 * Get health grade (A+ through F).
 */
function getGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

/**
 * Get color for grade.
 */
function getGradeColor(grade) {
  switch (grade) {
    case "A+":
    case "A":
      return "green";
    case "B":
      return "yellow";
    case "C":
      return "orange";
    case "D":
      return "red";
    case "F":
      return "red";
    default:
      return "gray";
  }
}

/**
 * Main metrics computation.
 */
function computeAllMetrics(repo, activity, issueStats, prStats, releases, advisories, contributors, languages) {
  const stars = starsScore(repo, activity);
  const issues = issuesScore(issueStats);
  const commits = commitFrequencyScore(activity);
  const readme = readmeScore(repo);
  const freshness = dependencyFreshnessScore(repo, releases);
  const security = securityScore(repo, advisories);
  const contributorsScore = contributorScore(contributors, repo);
  const prHealth = prHealthScore(prStats);
  const composite = computeHealthScore({ stars, issues, commits, readme, freshness, security, contributors: contributorsScore, prHealth });
  const grade = getGrade(composite);

  return {
    stars,
    issues,
    commits,
    readme,
    freshness,
    security,
    contributors: contributorsScore,
    prHealth,
    composite,
    grade,
  };
}

module.exports = {
  starsScore,
  issuesScore,
  commitFrequencyScore,
  readmeScore,
  dependencyFreshnessScore,
  securityScore,
  contributorScore,
  prHealthScore,
  computeHealthScore,
  getGrade,
  getGradeColor,
  computeAllMetrics,
};
