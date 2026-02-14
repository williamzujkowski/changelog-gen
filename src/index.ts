/**
 * changelog-gen — Generate categorized changelogs from git history.
 *
 * Library API for programmatic usage.
 *
 * @module changelog-gen
 */

export type {
  GitCommit,
  CategorizedCommit,
  CommitType,
  OutputFormat,
  ChangelogOptions,
  ChangelogResult,
} from './types.js';
export { CATEGORY_LABELS } from './types.js';

export { readGitLog, parseGitOutput, getLatestTag } from './git-reader.js';
export { categorizeCommit, categorizeAll, groupByType } from './categorizer.js';
export { formatChangelog } from './formatter.js';

import { readGitLog } from './git-reader.js';
import { categorizeAll, groupByType } from './categorizer.js';
import { formatChangelog } from './formatter.js';
import type { ChangelogOptions, ChangelogResult } from './types.js';

/**
 * Generate a changelog from git history.
 *
 * @param options - Configuration options
 * @returns The changelog result with categorized commits
 */
export function generateChangelog(options: ChangelogOptions): ChangelogResult {
  const commits = readGitLog(options.cwd, options.from, options.to);
  const categorized = categorizeAll(commits);
  const grouped = groupByType(categorized);

  return {
    commits: categorized,
    grouped,
    from: options.from,
    to: options.to,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate and format a changelog as a string.
 *
 * @param options - Configuration options
 * @returns Formatted changelog string
 */
export function generateFormattedChangelog(options: ChangelogOptions): string {
  const result = generateChangelog(options);
  return formatChangelog(result, options.format);
}
