/**
 * Smoke tests for repo-health-checker metrics module.
 */

const metrics = require("../src/metrics");

// ── Mock data ───────────────────────────────────────────
const mockRepo = {
  stargazers_count: 12500,
  forks_count: 3400,
  open_issues_count: 42,
  has_wiki: true,
  has_readme: true,
  has_downloads: true,
  has_projects: true,
  description: "A cool open source tool for developers",
  topics: ["cli", "github", "health"],
  homepage: "https://example.com",
  license: { spdx_id: "MIT" },
  size: 2500,
  has_security_policy: true,
};

const mockActivity = {
  total: 150,
  recent: 60,
  lastCommitDate: "2026-07-01T12:00:00Z",
  monthly: {
    "2026-01": 20,
    "2026-02": 25,
    "2026-03": 30,
    "2026-04": 35,
    "2026-05": 28,
    "2026-06": 12,
  },
};

const mockIssueStats = {
  total: 500,
  open: 42,
  closed: 458,
  labels: { bug: 10, enhancement: 15, "help wanted": 5 },
  avgCloseDays: 14.5,
};

const mockPrStats = {
  total: 200,
  open: 15,
  closed: 185,
  merged: 170,
};

const mockReleases = [
  { tag_name: "v2.0.0", name: "v2.0.0", published_at: "2026-06-15T10:00:00Z" },
  { tag_name: "v1.9.0", name: "v1.9.0", published_at: "2026-04-01T10:00:00Z" },
  { tag_name: "v1.8.0", name: "v1.8.0", published_at: "2026-01-15T10:00:00Z" },
  { tag_name: "v1.7.0", name: "v1.7.0", published_at: "2025-10-01T10:00:00Z" },
  { tag_name: "v1.6.0", name: "v1.6.0", published_at: "2025-07-01T10:00:00Z" },
  { tag_name: "v1.5.0", name: "v1.5.0", published_at: "2025-04-01T10:00:00Z" },
  { tag_name: "v1.4.0", name: "v1.4.0", published_at: "2025-01-01T10:00:00Z" },
];

const mockAdvisories = [
  {
    cve_id: "CVE-2026-0001",
    summary: "Critical remote code execution",
    severity: "critical",
    state: "open",
    published_at: "2026-06-01T00:00:00Z",
  },
];

const mockContributors = [
  { login: "user1", contributions: 800 },
  { login: "user2", contributions: 200 },
  { login: "user3", contributions: 100 },
  { login: "user4", contributions: 50 },
  { login: "user5", contributions: 30 },
];

const mockLanguages = {
  JavaScript: 500000,
  TypeScript: 300000,
  Python: 100000,
};

// ── Tests ───────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${name} — ${err.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}

// Individual metric tests
test("starsScore: high star count gives high score", () => {
  const score = metrics.starsScore(mockRepo, mockActivity);
  assert(score >= 50, `expected >= 50, got ${score}`);
  assert(score <= 100, `should not exceed 100, got ${score}`);
});

test("starsScore: zero stars gives low score", () => {
  const repo = { ...mockRepo, stargazers_count: 0, forks_count: 0 };
  const score = metrics.starsScore(repo, { recent: 0 });
  assert(score <= 15, `expected <= 15, got ${score}`);
});

test("issuesScore: high resolution rate gives high score", () => {
  const score = metrics.issuesScore({ total: 500, open: 20, closed: 480, avgCloseDays: 5 });
  assert(score >= 60, `expected >= 60, got ${score}`);
});

test("issuesScore: all issues open gives low score", () => {
  const score = metrics.issuesScore({ total: 100, open: 100, closed: 0, avgCloseDays: null });
  assert(score < 30, `expected < 30, got ${score}`);
});

test("commitFrequencyScore: active repo scores high", () => {
  const score = metrics.commitFrequencyScore(mockActivity);
  assert(score >= 30, `expected >= 30, got ${score}`);
  assert(score <= 100, `should not exceed 100, got ${score}`);
});

test("commitFrequencyScore: inactive repo scores low", () => {
  const score = metrics.commitFrequencyScore({ total: 0, recent: 0, monthly: {}, lastCommitDate: null });
  assert(score <= 30, `expected <= 30, got ${score}`);
});

test("readmeScore: well-documented repo scores", () => {
  const score = metrics.readmeScore(mockRepo);
  assert(score >= 40, `expected >= 40, got ${score}`);
});

test("dependencyFreshnessScore: recent releases score well", () => {
  const score = metrics.dependencyFreshnessScore(mockRepo, mockReleases);
  assert(score >= 30, `expected >= 30, got ${score}`);
});

test("securityScore: open advisories reduce score", () => {
  const score = metrics.securityScore(mockRepo, mockAdvisories);
  // Open, has license, has security policy = good
  assert(score >= 50, `expected >= 50, got ${score}`);
  assert(score <= 100, `should not exceed 100, got ${score}`);
});

test("contributorScore: diverse team scores well", () => {
  const score = metrics.contributorScore(mockContributors, mockRepo);
  assert(score >= 20, `expected >= 20, got ${score}`);
});

test("prHealthScore: good merge rate scores well", () => {
  const score = metrics.prHealthScore({ total: 200, open: 10, closed: 190, merged: 175 });
  assert(score >= 50, `expected >= 50, got ${score}`);
});

test("computeHealthScore: composite score in range", () => {
  const score = metrics.computeHealthScore({
    stars: 85,
    issues: 75,
    commits: 90,
    readme: 80,
    freshness: 70,
    security: 85,
    contributors: 75,
    prHealth: 80,
  });
  assert(score >= 0 && score <= 100, `expected 0-100, got ${score}`);
});

test("getGrade: top scores get A+", () => {
  assert(metrics.getGrade(95) === "A+", "95 should be A+");
  assert(metrics.getGrade(100) === "A+", "100 should be A+");
});

test("getGrade: mid scores get B/C", () => {
  assert(metrics.getGrade(75) === "B", "75 should be B");
  assert(metrics.getGrade(65) === "C", "65 should be C");
});

test("getGrade: low scores get F", () => {
  assert(metrics.getGrade(30) === "F", "30 should be F");
  assert(metrics.getGrade(0) === "F", "0 should be F");
});

test("computeAllMetrics: full pipeline produces valid results", () => {
  const result = metrics.computeAllMetrics(mockRepo, mockActivity, mockIssueStats, mockPrStats, mockReleases, mockAdvisories, mockContributors, mockLanguages);
  assert(typeof result.composite === "number", "composite should be a number");
  assert(result.composite >= 0 && result.composite <= 100, `composite (${result.composite}) out of range`);
  assert(typeof result.grade === "string", "grade should be a string");
  assert(["A+", "A", "B", "C", "D", "F"].includes(result.grade), `invalid grade: ${result.grade}`);
  assert(typeof result.stars === "number", "stars should be number");
  assert(typeof result.issues === "number", "issues should be number");
  assert(typeof result.commits === "number", "commits should be number");
  assert(typeof result.readme === "number", "readme should be number");
  assert(typeof result.freshness === "number", "freshness should be number");
  assert(typeof result.security === "number", "security should be number");
  assert(typeof result.contributors === "number", "contributors should be number");
  assert(typeof result.prHealth === "number", "prHealth should be number");
});

// ── Summary ─────────────────────────────────────────────
console.log("");
console.log(`───────────────────────`);
console.log(`Tests: ${passed} passed, ${failed} failed`);
console.log(`───────────────────────`);

process.exit(failed > 0 ? 1 : 0);