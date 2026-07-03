#!/usr/bin/env node
/**
 * CLI entry point — parses args, orchestrates the health check.
 */

const { Command } = require("commander");
const { getRepo, getActivity, getIssueStats, getPRStats, getReleases, getSecurityAdvisories, getContributors, getLanguages } = require("./github");
const { computeAllMetrics, getGrade, getGradeColor } = require("./metrics");
const { formatResult, buildResult } = require("./formatter");

const program = new Command();

program
  .name("repo-health-checker")
  .description("Analyze GitHub repositories for health metrics and composite scores")
  .version("1.0.0")
  .arguments("<owner/repo>")
  .option("-f, --format <type>", "Output format (table|json)", "table")
  .option("-o, --output <file>", "Write output to file instead of stdout")
  .option("-v, --verbose", "Show detailed breakdown")
  .option("--json", "Alias for --format json")
  .option("--no-color", "Disable color output")
  .option("-t, --token <token>", "GitHub personal access token (or use GITHUB_TOKEN env)")
  .action(async (ownerRepo, cmd) => {
    const format = cmd.json ? "json" : (cmd.format || "table");
    const colorize = cmd.color !== false;

    // Set token if provided
    if (cmd.token) {
      process.env.GITHUB_TOKEN = cmd.token;
    }

    // Parse owner/repo
    const parts = ownerRepo.split("/");
    if (parts.length !== 2) {
      console.error("Error: Please provide owner/repo (e.g., nodejs/node)");
      process.exit(1);
    }
    const [owner, repo] = parts;

    console.error(`🔍 Analyzing ${owner}/${repo}...\n`);

    try {
      // Fetch all data in parallel where possible
      const [
        repoData,
        activity,
        issueStats,
        prStats,
        releases,
        advisories,
        contributors,
        languages,
      ] = await Promise.all([
        getRepo(owner, repo),
        getActivity(owner, repo),
        getIssueStats(owner, repo),
        getPRStats(owner, repo),
        getReleases(owner, repo),
        getSecurityAdvisories(owner, repo),
        getContributors(owner, repo),
        getLanguages(owner, repo),
      ]);

      // Compute metrics
      const metrics = computeAllMetrics(
        repoData,
        activity,
        issueStats,
        prStats,
        releases,
        advisories,
        contributors,
        languages
      );

      // Build result
      const result = buildResult(
        repoData,
        activity,
        issueStats,
        prStats,
        releases,
        advisories,
        contributors,
        languages,
        metrics
      );

      // Format output
      let output;
      if (format === "json") {
        output = formatResult(result, "json", { pretty: cmd.verbose });
      } else {
        output = formatResult(result, "table", { colorize });
      }

      // Output
      if (cmd.output) {
        const fs = require("fs");
        fs.writeFileSync(cmd.output, output);
        console.error(`✅ Output written to ${cmd.output}`);
      } else {
        console.log(output);
      }

      // Exit with code based on score
      if (metrics.composite < 40) {
        process.exit(2);
      } else if (metrics.composite < 60) {
        process.exit(1);
      }
      process.exit(0);

    } catch (err) {
      console.error(`\n❌ Error: ${err.message}`);
      if (err.message.includes("404")) {
        console.error("\n💡 The repository may not exist or be private.");
      }
      process.exit(1);
    }
  });

// Handle --help for subcommands
program.addHelpText("before", `
  ${program.name()} v${program.version()}
  Analyze GitHub repositories for health metrics and composite scores.

  Usage:
    repo-health-checker owner/repo           # Table output (default)
    repo-health-checker owner/repo --json    # JSON output
    repo-health-checker nodejs/node --json   # Detailed JSON
`);

program.parse(process.argv);
