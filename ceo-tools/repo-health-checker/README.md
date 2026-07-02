# repo-health-checker

> Analyze any GitHub repository for health metrics and get a composite score.

A fast, dependency-minimal CLI tool that queries the GitHub REST API and produces actionable health insights — stars, issues, commits, dependencies, security advisories, and more — all in a single command.

## 🚀 Why?

- **Quick audits** — evaluate repos before contributing or adopting
- **CI/CD integration** — detect degrading health over time
- **No setup** — works out of the box, no auth needed for public repos
- **Machine-readable** — clean JSON output for pipelines

## 📦 Installation

```bash
# npm (recommended)
npm install -g repo-health-checker

# or use directly via npx
npx repo-health-checker owner/repo
```

## 💡 Usage

### Default (pretty table)

```bash
repo-health-checker nodejs/node
```

### JSON output

```bash
repo-health-checker nodejs/node --json
```

### Save to file

```bash
repo-health-checker nodejs/node --json -o health-report.json
```

### Verbose

```bash
repo-health-checker nodejs/node --json -v
```

### No colors (CI-friendly)

```bash
repo-health-checker nodejs/node --no-color
```

## 📊 What It Measures

| Metric | Description | Weight |
|--------|-------------|--------|
| ⭐ **Stars & Engagement** | Star count, fork ratio, recent activity | 20% |
| 🐛 **Issue Resolution** | Resolution rate, backlog, avg close time | 20% |
| 📊 **Commit Frequency** | Recent commits, consistency | 15% |
| 📖 **README Quality** | Presence, description, license, topics | 10% |
| 📦 **Dependency Freshness** | Release recency, frequency | 10% |
| 🔒 **Security** | Open advisories, license, security policy | 10% |
| 👥 **Contributors** | Diversity, maintainer health | 5% |
| 📥 **PR Health** | Merge rate, open backlog | 10% |

### Composite Score

| Grade | Score | Meaning |
|-------|-------|---------|
| A+ | 90-100 | Excellent |
| A | 80-89 | Great |
| B | 70-79 | Good |
| C | 60-69 | Fair |
| D | 50-59 | Needs work |
| F | <50 | Critical |

## 🔌 CI/CD Integration

### GitHub Actions

```yaml
- name: Check repo health
  run: npx repo-health-checker ${{ github.repository }} --json -o report.json

- name: Fail on low health
  run: |
    score=$(jq '.metrics.composite' report.json)
    if [ "$score" -lt 60 ]; then
      echo "Health score $score is below threshold (60)"
      exit 1
    fi
```

### Shell Script

```bash
#!/bin/bash
score=$(npx repo-health-checker $REPO --json 2>/dev/null | jq '.metrics.composite')
echo "Health: $score/100"
```

## 🧪 Example Output

```
  🟢  nodejs/node
  The Node.js JavaScript runtime

  ──────────────────────────────────────────────────────────
  Health Score:  87/100  (A)
  ──────────────────────────────────────────────────────────

  Metrics Breakdown:

  ⭐  Stars & Engagement      85%  ████████████████████░░
  🐛  Issue Resolution        72%  ██████████████████░░░░
  📊  Commit Frequency        90%  ██████████████████████
  📖  README Quality          80%  ██████████████████░░░░
  📦  Dependency Freshness    75%  █████████████████░░░░░
  🔒  Security                95%  ████████████████████████
  👥  Contributors            88%  ████████████████████░░░░
  📥  PR Health               82%  ████████████████████░░░░

  Repository Stats:

    🌟  Stars:             107,500
    🍴  Forks:             40,200
    💻  Primary Language:  JavaScript
    📜  License:           MIT
    📅  Last Commit:       2026-07-02T10:30:00Z
    📋  Open Issues:       1,250
    👥  Contributors:      1,840

  Issue Analysis:

    📋  Total Issues:     12,450
    ✅  Closed:           11,200
    📌  Open:             1,250
    📊  Resolution Rate:  89.9%
    ⏱️   Avg Close Time:  14.3 days
```

## 🛠️ Development

```bash
# Clone and install
git clone https://github.com/linkofdarkness/repo-health-checker.git
cd repo-health-checker
npm install

# Run locally
node bin/repo-health-checker nodejs/node

# Run tests
npm test
```

## 🔑 Rate Limits

| Auth Level | Limit |
|------------|-------|
| Unauthenticated | 60 requests/hour |
| Personal Access Token | 5,000 requests/hour |

For heavy usage, add a token via the `-H "Authorization: Bearer YOUR_TOKEN"` header or set `GITHUB_TOKEN` env var. The tool will gracefully handle rate limits with automatic retries.

## 📄 License

MIT — use it, fork it, improve it.

## 🤝 Contributing

Issues and PRs welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting.
