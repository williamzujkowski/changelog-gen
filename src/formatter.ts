/**
 * Output formatters for changelog generation.
 *
 * Supports markdown, JSON, and plain text output.
 */

import { CATEGORY_LABELS } from './types.js';
import type {
  ChangelogResult,
  CategorizedCommit,
  CommitType,
  OutputFormat,
} from './types.js';

/** Category display order (most interesting first). */
const CATEGORY_ORDER: readonly CommitType[] = [
  'feat', 'fix', 'perf', 'refactor', 'docs',
  'test', 'ci', 'build', 'style', 'chore', 'other',
];

/**
 * Format a changelog result in the specified format.
 */
export function formatChangelog(
  result: ChangelogResult,
  format: OutputFormat
): string {
  switch (format) {
    case 'markdown':
      return formatMarkdown(result);
    case 'json':
      return formatJson(result);
    case 'text':
      return formatText(result);
  }
}

/** Format as markdown. */
function formatMarkdown(result: ChangelogResult): string {
  const lines: string[] = [];
  const range = result.from !== undefined
    ? `${result.from}..${result.to}`
    : result.to;
  lines.push(`# Changelog (${range})\n`);

  if (result.commits.length === 0) {
    lines.push('No commits found.\n');
    return lines.join('\n');
  }

  // Breaking changes section
  const breaking = result.commits.filter((c) => c.breaking);
  if (breaking.length > 0) {
    lines.push('## BREAKING CHANGES\n');
    for (const c of breaking) {
      lines.push(`- **${c.description}** (${c.commit.shortHash})`);
    }
    lines.push('');
  }

  // Grouped categories
  for (const type of CATEGORY_ORDER) {
    const commits = result.grouped.get(type);
    if (commits === undefined || commits.length === 0) continue;

    const label = CATEGORY_LABELS[type];
    lines.push(`## ${label}\n`);
    for (const c of commits) {
      const scope = c.scope !== undefined ? `**${c.scope}:** ` : '';
      lines.push(`- ${scope}${c.description} (${c.commit.shortHash})`);
    }
    lines.push('');
  }

  lines.push(`---\n*Generated at ${result.generatedAt}*\n`);
  return lines.join('\n');
}

/** Format as JSON. */
function formatJson(result: ChangelogResult): string {
  const data = {
    from: result.from,
    to: result.to,
    generatedAt: result.generatedAt,
    totalCommits: result.commits.length,
    breaking: result.commits.filter((c) => c.breaking).map(commitToJson),
    categories: Object.fromEntries(
      CATEGORY_ORDER
        .filter((type) => (result.grouped.get(type)?.length ?? 0) > 0)
        .map((type) => [
          type,
          (result.grouped.get(type) ?? []).map(commitToJson),
        ])
    ),
  };
  return JSON.stringify(data, null, 2);
}

/** Convert a categorized commit to a JSON-safe object. */
function commitToJson(c: CategorizedCommit): Record<string, unknown> {
  return {
    hash: c.commit.shortHash,
    type: c.type,
    scope: c.scope,
    description: c.description,
    author: c.commit.author,
    date: c.commit.date,
    breaking: c.breaking,
  };
}

/** Format as plain text. */
function formatText(result: ChangelogResult): string {
  const lines: string[] = [];
  const range = result.from !== undefined
    ? `${result.from}..${result.to}`
    : result.to;
  lines.push(`Changelog (${range})`);
  lines.push('='.repeat(40));

  if (result.commits.length === 0) {
    lines.push('\nNo commits found.');
    return lines.join('\n');
  }

  for (const type of CATEGORY_ORDER) {
    const commits = result.grouped.get(type);
    if (commits === undefined || commits.length === 0) continue;

    const label = CATEGORY_LABELS[type];
    lines.push(`\n${label}:`);
    for (const c of commits) {
      const scope = c.scope !== undefined ? `(${c.scope}) ` : '';
      const flag = c.breaking ? ' [BREAKING]' : '';
      lines.push(`  - ${scope}${c.description}${flag} [${c.commit.shortHash}]`);
    }
  }

  return lines.join('\n');
}
