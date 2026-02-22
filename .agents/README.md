## AI Agent Guide (start here)

This repository stores agent guidance in the `.agents/` directory.

## Where the rules are

- **Rules directory**: `.agents/rules/`
- **Rule files**: `*.mdc` (Markdown-with-conventions for agent instructions)

If you’re looking for “how to behave in this repo”, start with the files in `.agents/rules/`.

## When to use the rules

Use the rules as **constraints** and **process guidance** whenever you:

- **Change code**: follow repo conventions (style, structure, naming, frameworks).
- **Make Git changes**: follow commit/pull request expectations when applicable.
- **Review or propose changes**: match the requested review tone/format and scope boundaries.
- **Are uncertain**: prefer the rules over assumptions; treat them as the source of truth for repo-specific preferences.

## Rule format conventions

- **`.mdc`** files in `.agents/rules/` are authoritative instructions for agents.
- Prefer applying the **most relevant** rule(s) to the current task context.
- If multiple rules apply, resolve conflicts by:
  - Prioritizing **explicit user instructions** first.
  - Otherwise following **repo scope/guardrails** rules to keep changes minimal and reviewable.

## Quick index

- `.agents/rules/scope-of-work.mdc`: keep changes tightly scoped to the ask.
- `.agents/rules/git-committing.mdc`: commit message and commit-size conventions.
- `.agents/rules/pull-requests.mdc`: PR review style and guidelines.
- `.agents/rules/dotnet-guidelines.mdc`: C#/.NET repo structure and coding standards.

