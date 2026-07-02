# AI-Powered PR Review

> Automated pull request review using LLM-powered code analysis.

## What It Does

When a PR is opened or updated, this action:
1. Fetches the PR diff and metadata
2. Analyzes code quality, security, and performance
3. Posts a structured review comment on the PR
4. Highlights strengths, concerns, and suggestions

## Setup

### 1. Add workflow file (`.github/workflows/ai-pr-review.yml`)

```yaml
name: AI PR Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: byte-ai/ai-pr-review@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          model: auto
```

## Configuration

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `github_token` | Yes | — | GitHub PAT with repo scope |
| `model` | No | `auto` | LLM model to use |
| `max_tokens` | No | `4096` | Max response tokens |

## Output

The action posts a review comment on the PR with:
- Overall assessment (Good / Needs Work / Blocker)
- Strengths of the PR
- Concerns and issues found
- Security review findings
- Improvement suggestions
- Changes overview

## License

MIT
