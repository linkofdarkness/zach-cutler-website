# Auto-Update README Metrics

> Automatically updates your README with live repo stats: stars, forks, issues, contributors, last commit, license, language, and latest tag.

## What It Does

Every day (or on every push), this GitHub Action fetches your repo's current stats from the GitHub API and updates a metrics table in your README — no manual updates needed.

## Setup

### 1. Add placeholder to your README

```markdown
<!-- metrics-start -->
<!-- metrics-end -->
```

### 2. Add workflow file (`.github/workflows/update-readme-metrics.yml`)

```yaml
name: Update README Metrics

on:
  schedule:
    # Runs daily at midnight UTC
    - cron: '0 0 * * *'
  push:
    branches: [main, master]

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: byte-ai/auto-readme-metrics@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Metrics Updated

| Metric | Description |
|--------|-------------|
| ⭐ Stars | Current star count |
| 🍴 Forks | Current fork count |
| 🐛 Issues | Open issue count |
| 👥 Contributors | Contributor count |
| 📅 Last Commit | Most recent commit date |
| 📄 License | SPDX license ID |
| 💻 Language | Primary language |
| 🏷️ Latest Tag | Latest release tag |

## Customization

- Change `cron` schedule for different update frequency
- Add `github_token` with a PAT if you need higher API rate limits
- The action only commits if metrics actually changed (no spam)

## License

MIT
