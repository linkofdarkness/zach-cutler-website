/**
 * GitHub REST API client — public endpoints, no auth required for basic info.
 * Rate limit: 60 req/hour unauthenticated, 5000 req/hour authenticated.
 */

const BASE = "https://api.github.com";

/**
 * Get auth headers from environment.
 */
function getAuthHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/**
 * Fetch with retry and rate-limit awareness.
 * Returns parsed JSON or throws.
 */
async function fetchJSON(url, opts = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...getAuthHeaders(),
    ...opts.headers,
  };

  let retries = 3;
  while (retries > 0) {
    const res = await fetch(url, { headers });

    if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
      const retryAfter = res.headers.get("retry-after");
      const wait = (parseInt(retryAfter, 10) || 60) * 1000;
      console.error(`⚠️  Rate limited. Waiting ${wait / 1000}s before retry...`);
      await new Promise((r) => setTimeout(r, wait));
      retries--;
      continue;
    }

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText} for ${url}`);
    }

    return res.json();
  }

  throw new Error("GitHub API rate limit exceeded after retries.");
}

/**
 * Paginate — fetch all pages of a paginated endpoint.
 */
async function* paginate(url, headers = {}) {
  let nextUrl = url;
  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...getAuthHeaders(),
        ...headers,
      },
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText} for ${url}`);
    }

    const items = await res.json();
    yield* (Array.isArray(items) ? items : [items]);

    const link = res.headers.get("link");
    nextUrl = null;
    if (link) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      if (match) nextUrl = match[1];
    }
  }
}

/**
 * Fetch all repos for a user/org.
 */
async function getRepos(owner, type = "owner", perPage = 100) {
  const repos = [];
  for await (const repo of paginate(
    `${BASE}/users/${owner}/repos?per_page=${perPage}&sort=updated&type=${type}`
  )) {
    repos.push(repo);
  }
  return repos;
}

/**
 * Fetch a single repo.
 */
async function getRepo(owner, repo) {
  return fetchJSON(`${BASE}/repos/${owner}/${repo}`);
}

/**
 * Fetch issues with optional filters.
 * Returns all issues (paginated).
 */
async function getIssues(owner, repo, state = "all", perPage = 100) {
  const issues = [];
  for await (const issue of paginate(
    `${BASE}/repos/${owner}/${repo}/issues?per_page=${perPage}&state=${state}&sort=created&direction=desc`
  )) {
    issues.push(issue);
  }
  return issues;
}

/**
 * Fetch commits (paginated).
 */
async function getCommits(owner, repo, perPage = 100) {
  const commits = [];
  for await (const commit of paginate(
    `${BASE}/repos/${owner}/${repo}/commits?per_page=${perPage}&since=2024-01-01T00:00:00Z`
  )) {
    commits.push(commit);
  }
  return commits;
}

/**
 * Fetch branches for default branch detection.
 */
async function getDefaultBranch(owner, repo) {
  const repoData = await getRepo(owner, repo);
  return repoData.default_branch || "main";
}

/**
 * Fetch pull requests.
 */
async function getPullRequests(owner, repo, state = "all", perPage = 100) {
  const prs = [];
  for await (const pr of paginate(
    `${BASE}/repos/${owner}/${repo}/pulls?per_page=${perPage}&state=${state}&sort=created&direction=desc`
  )) {
    prs.push(pr);
  }
  return prs;
}

/**
 * Fetch tags for version info.
 */
async function getTags(owner, repo, perPage = 100) {
  const tags = [];
  for await (const tag of paginate(
    `${BASE}/repos/${owner}/${repo}/tags?per_page=${perPage}`
  )) {
    tags.push(tag);
  }
  return tags;
}

/**
 * Fetch releases.
 */
async function getReleases(owner, repo, perPage = 100) {
  const releases = [];
  for await (const release of paginate(
    `${BASE}/repos/${owner}/${repo}/releases?per_page=${perPage}`
  )) {
    releases.push(release);
  }
  return releases;
}

/**
 * Fetch security advisories for a repo.
 */
async function getSecurityAdvisories(owner, repo, perPage = 100) {
  const advisories = [];
  for await (const advisory of paginate(
    `${BASE}/repos/${owner}/${repo}/security-advisories?per_page=${perPage}`
  )) {
    advisories.push(advisory);
  }
  return advisories;
}

/**
 * Fetch dependency graph manifest (package-lock.json or similar).
 * We check common manifests for dependency info.
 */
async function getDependencies(owner, repo) {
  const manifests = [
    { name: "package.json", path: "package.json", lang: "javascript" },
    { name: "requirements.txt", path: "requirements.txt", lang: "python" },
    { name: "Cargo.toml", path: "Cargo.toml", lang: "rust" },
    { name: "go.mod", path: "go.mod", lang: "go" },
    { name: "pom.xml", path: "pom.xml", lang: "java" },
  ];

  const deps = [];
  for (const m of manifests) {
    try {
      const res = await fetch(
        `${BASE}/repos/${owner}/${repo}/contents/${m.path}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            ...getAuthHeaders(),
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        deps.push({ ...m, content, path: data.path, size: data.size });
      }
    } catch {
      // manifest not found — skip
    }
  }
  return deps;
}

/**
 * Fetch languages for the repo.
 */
async function getLanguages(owner, repo) {
  return fetchJSON(`${BASE}/repos/${owner}/${repo}/languages`);
}

/**
 * Get recent activity (last 90 days of commits).
 */
async function getActivity(owner, repo) {
  const commits = await getCommits(owner, repo);
  const now = new Date();
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

  // Group commits by month
  const monthly = {};
  for (const commit of commits) {
    const date = new Date(commit.commit.author.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthly[key] = (monthly[key] || 0) + 1;
  }

  // Count recent commits (last 90 days)
  const recentCommits = commits.filter((c) => new Date(c.commit.author.date) >= ninetyDaysAgo);

  return {
    total: commits.length,
    recent: recentCommits.length,
    monthly,
    lastCommitDate: commits.length > 0 ? commits[0].commit.author.date : null,
  };
}

/**
 * Get contributor count.
 */
async function getContributors(owner, repo) {
  const contributors = [];
  for await (const c of paginate(
    `${BASE}/repos/${owner}/${repo}/contributors?per_page=100&anon=1`
  )) {
    contributors.push(c);
  }
  return contributors;
}

/**
 * Get open issues count by label/type.
 */
async function getIssueStats(owner, repo) {
  const [allIssues, openIssues, closedIssues] = await Promise.all([
    getIssues(owner, repo, "all"),
    getIssues(owner, repo, "open"),
    getIssues(owner, repo, "closed"),
  ]);

  // Categorize open issues by label
  const labels = {};
  for (const issue of openIssues) {
    for (const label of issue.labels || []) {
      labels[label.name] = (labels[label.name] || 0) + 1;
    }
  }

  // Calculate average time to close
  let avgCloseTime = null;
  if (closedIssues.length > 0) {
    const closeTimes = [];
    for (const issue of closedIssues) {
      if (issue.closed_at && issue.created_at) {
        closeTimes.push(new Date(issue.closed_at) - new Date(issue.created_at));
      }
    }
    if (closeTimes.length > 0) {
      avgCloseTime = closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length;
    }
  }

  return {
    total: allIssues.length,
    open: openIssues.length,
    closed: closedIssues.length,
    labels,
    avgCloseDays: avgCloseTime ? (avgCloseTime / (1000 * 60 * 60 * 24)).toFixed(1) : null,
  };
}

/**
 * Get pull request stats.
 */
async function getPRStats(owner, repo) {
  const [allPRs, openPRs, mergedPRs, closedPRs] = await Promise.all([
    getPullRequests(owner, repo, "all"),
    getPullRequests(owner, repo, "open"),
    getPullRequests(owner, repo, "closed"),
    getPullRequests(owner, repo, "merged"),
  ]);

  return {
    total: allPRs.length,
    open: openPRs.length,
    closed: closedPRs.length,
    merged: mergedPRs.length,
  };
}

module.exports = {
  fetchJSON,
  getRepo,
  getRepos,
  getIssues,
  getCommits,
  getDefaultBranch,
  getPullRequests,
  getTags,
  getReleases,
  getSecurityAdvisories,
  getDependencies,
  getLanguages,
  getActivity,
  getContributors,
  getIssueStats,
  getPRStats,
};
