/**
 * Output formatter — JSON and pretty table formats.
 */

/**
 * Format output based on format option.
 */
function formatResult(data, format = "table", options = {}) {
  switch (format) {
    case "json":
      return formatJSON(data, options);
    case "table":
    default:
      return formatTable(data, options);
  }
}

/**
 * Format as pretty JSON.
 */
function formatJSON(data, { pretty = true } = {}) {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Format as a pretty ASCII table.
 */
function formatTable(result, { colorize = true } = {}) {
  const { repo, metrics } = result;

  const lines = [];
  const divider = "─".repeat(50);

  // Header
  const gradeColor = metrics.grade === "A+" || metrics.grade === "A" ? "🟢" :
    metrics.grade === "B" ? "🟡" :
    metrics.grade === "C" ? "🟠" : "🔴";

  lines.push("");
  lines.push(`  ${gradeColor}  ${chalk.bold(repo.full_name)}`);
  lines.push(`  ${chalk.dim(repo.description || "")}`);
  lines.push(`  ${divider}`);
  lines.push(`  ${chalk.bold("Health Score:")}  ${chalk.bold(metrics.composite)}/100  (${metrics.grade})`);
  lines.push(`  ${divider}`);
  lines.push("");

  // Metrics breakdown
  lines.push(`  ${chalk.bold("Metrics Breakdown:")}`);
  lines.push("");

  const metricList = [
    { label: "⭐ Stars & Engagement", value: metrics.stars, icon: "⭐" },
    { label: "🐛 Issue Resolution", value: metrics.issues, icon: "🐛" },
    { label: "📊 Commit Frequency", value: metrics.commits, icon: "📊" },
    { label: "📖 README Quality", value: metrics.readme, icon: "📖" },
    { label: "📦 Dependency Freshness", value: metrics.freshness, icon: "📦" },
    { label: "🔒 Security", value: metrics.security, icon: "🔒" },
    { label: "👥 Contributors", value: metrics.contributors, icon: "👥" },
    { label: "📥 PR Health", value: metrics.prHealth, icon: "📥" },
  ];

  for (const m of metricList) {
    const bar = generateBar(m.value);
    const colorFunc = getScoreColor(m.value, colorize);
    lines.push(`  ${m.icon}  ${colorFunc(`${m.label.padEnd(25)} ${String(m.value).padStart(3)}%  ${bar}`)}`);
  }

  lines.push("");

  // Repo stats
  if (repo.stats) {
    lines.push(`  ${chalk.bold("Repository Stats:")}`);
    lines.push("");
    const stats = repo.stats;

    if (stats.stars != null) lines.push(`    🌟  Stars:             ${chalk.yellow(stats.stars.toLocaleString())}`);
    if (stats.forks != null) lines.push(`    🍴  Forks:             ${chalk.yellow(stats.forks.toLocaleString())}`);
    if (stats.views != null) lines.push(`    👁️   Views:             ${chalk.yellow(stats.views.toLocaleString())}`);
    if (stats.language) lines.push(`    💻  Primary Language:  ${chalk.cyan(stats.language)}`);
    if (stats.license) lines.push(`    📜  License:           ${chalk.green(stats.license)}`);
    if (stats.lastCommit) lines.push(`    📅  Last Commit:       ${chalk.dim(stats.lastCommit)}`);
    if (stats.openIssues != null) lines.push(`    📋  Open Issues:       ${stats.openIssues > 0 ? chalk.yellow(stats.openIssues.toLocaleString()) : chalk.green("0")}`);
    if (stats.contributors != null) lines.push(`    👥  Contributors:      ${chalk.yellow(stats.contributors.toLocaleString())}`);

    if (stats.languages) {
      const langEntries = Object.entries(stats.languages).slice(0, 5);
      if (langEntries.length > 0) {
        lines.push(`    🌐  Languages:`);
        const total = Object.values(stats.languages).reduce((a, b) => a + b, 0);
        for (const [lang, bytes] of langEntries) {
          const pct = ((bytes / total) * 100).toFixed(1);
          lines.push(`          ${chalk.cyan(lang.padEnd(15))} ${pct}%`);
        }
      }
    }
  }

  // Issue stats
  if (repo.issueStats && repo.issueStats.total > 0) {
    lines.push("");
    lines.push(`  ${chalk.bold("Issue Analysis:")}`);
    lines.push("");
    const is = repo.issueStats;
    lines.push(`    📋  Total Issues:     ${chalk.yellow(is.total.toLocaleString())}`);
    lines.push(`    ✅  Closed:           ${chalk.green(is.closed.toLocaleString())}`);
    lines.push(`    📌  Open:             ${is.open > 0 ? chalk.yellow(is.open.toLocaleString()) : chalk.green("0")}`);
    lines.push(`    📊  Resolution Rate:  ${is.total > 0 ? chalk.cyan((is.closed / is.total * 100).toFixed(1) + "%") : chalk.dim("N/A")}`);
    if (is.avgCloseDays !== null) {
      lines.push(`    ⏱️   Avg Close Time:  ${chalk.dim(is.avgCloseDays + " days")}`);
    }
  }

  // Security advisories
  if (repo.advisories && repo.advisories.length > 0) {
    lines.push("");
    lines.push(`  ${chalk.bold("⚠️  Security Advisories:")}`);
    lines.push("");
    for (const a of repo.advisories) {
      const severity = a.severity || "unknown";
      const sevColor = severity === "critical" ? chalk.red.bold :
        severity === "high" ? chalk.red :
        severity === "moderate" ? chalk.yellow : chalk.blue;
      lines.push(`    ${sevColor(`[${severity.toUpperCase()}]`)} ${a.summary}`);
      if (a.cve_id) lines.push(`           CVE: ${chalk.dim(a.cve_id)}`);
      if (a.published_at) lines.push(`           Published: ${chalk.dim(a.published_at.slice(0, 10))}`);
    }
  }

  // Recent activity summary
  if (repo.activity && repo.activity.monthly) {
    lines.push("");
    lines.push(`  ${chalk.bold("Activity (Last 90 Days):")}`);
    lines.push("");
    const months = Object.entries(repo.activity.monthly).sort();
    for (const [month, count] of months) {
      const bar = "▄".repeat(Math.min(count / 2, 30));
      lines.push(`    ${chalk.dim(month)}  ${chalk.cyan(String(count).padStart(4))}  ${bar}`);
    }
  }

  // Repo URL
  lines.push("");
  lines.push(`  ${chalk.dim("─".repeat(50))}`);
  lines.push(`  ${chalk.dim(repo.url || repo.html_url)}`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Generate a visual bar for a score.
 */
function generateBar(score, width = 20) {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  const bar = "█".repeat(filled) + "░".repeat(Math.max(0, empty));
  return bar;
}

/**
 * Get color function for a score value.
 */
function getScoreColor(score, colorize = true) {
  if (!colorize) return (s) => s;
  return (s) => {
    if (score >= 80) return s; // Let chalk handle via our caller
    if (score >= 60) return s;
    if (score >= 40) return s;
    return s;
  };
}

/**
 * Build the full result object from raw data and computed metrics.
 */
function buildResult(repo, activity, issueStats, prStats, releases, advisories, contributors, languages, metrics) {
  return {
    repo: {
      full_name: repo.full_name,
      name: repo.name,
      owner: repo.owner?.login,
      description: repo.description,
      html_url: repo.html_url,
      url: repo.html_url,
      stats: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        views: repo.watchers_count,
        language: repo.language,
        license: repo.license?.spdx_id || repo.license?.name,
        topics: repo.topics,
        lastCommit: activity?.lastCommitDate,
        openIssues: repo.open_issues_count,
        contributors: contributors?.length || 0,
        languages,
      },
      issueStats: {
        total: issueStats?.total || 0,
        open: issueStats?.open || 0,
        closed: issueStats?.closed || 0,
        labels: issueStats?.labels || {},
        avgCloseDays: issueStats?.avgCloseDays,
      },
      prStats: {
        total: prStats?.total || 0,
        open: prStats?.open || 0,
        closed: prStats?.closed || 0,
        merged: prStats?.merged || 0,
      },
      advisories: (advisories || []).map((a) => ({
        cve_id: a.cve_id,
        summary: a.summary,
        severity: a.severity,
        state: a.state,
        published_at: a.published_at,
      })),
      activity: {
        total: activity?.total || 0,
        recent: activity?.recent || 0,
        monthly: activity?.monthly || {},
      },
    },
    metrics: {
      composite: metrics.composite,
      grade: metrics.grade,
      breakdown: {
        stars: metrics.stars,
        issues: metrics.issues,
        commits: metrics.commits,
        readme: metrics.readme,
        freshness: metrics.freshness,
        security: metrics.security,
        contributors: metrics.contributors,
        prHealth: metrics.prHealth,
      },
    },
  };
}

/**
 * Simple chalk shim for plain text (no colors).
 */
const chalk = {
  bold: (s) => s,
  dim: (s) => s,
  green: (s) => s,
  yellow: (s) => s,
  red: (s) => s,
  cyan: (s) => s,
  blue: (s) => s,
  gray: (s) => s,
  red: { bold: (s) => s },
};

module.exports = {
  formatResult,
  formatJSON,
  formatTable,
  buildResult,
  generateBar,
};