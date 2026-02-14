/**
 * Conventional commit categorizer.
 *
 * Parses commit subjects and classifies them by type.
 */

import type { GitCommit, CategorizedCommit, CommitType } from './types.js';

/** Regex for conventional commit format: type(scope)!: description */
const CONVENTIONAL_RE =
  /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?\s*:\s*(?<desc>.+)$/i;

/** Valid conventional commit types. */
const VALID_TYPES = new Set<CommitType>([
  'feat', 'fix', 'refactor', 'docs', 'test',
  'chore', 'perf', 'ci', 'style', 'build',
]);

/**
 * Categorize a single commit.
 *
 * Attempts to parse as conventional commit. Falls back to 'other'.
 */
export function categorizeCommit(commit: GitCommit): CategorizedCommit {
  const match = CONVENTIONAL_RE.exec(commit.subject);

  if (match?.groups) {
    const rawType = match.groups['type']?.toLowerCase() ?? 'other';
    const type: CommitType = VALID_TYPES.has(rawType as CommitType)
      ? (rawType as CommitType)
      : 'other';

    return {
      commit,
      type,
      scope: match.groups['scope'],
      description: match.groups['desc'] ?? commit.subject,
      breaking: match.groups['breaking'] === '!' ||
        commit.body.includes('BREAKING CHANGE'),
    };
  }

  return {
    commit,
    type: 'other',
    scope: undefined,
    description: commit.subject,
    breaking: commit.body.includes('BREAKING CHANGE'),
  };
}

/**
 * Categorize all commits.
 */
export function categorizeAll(
  commits: readonly GitCommit[]
): readonly CategorizedCommit[] {
  return commits.map(categorizeCommit);
}

/**
 * Group categorized commits by type.
 */
export function groupByType(
  commits: readonly CategorizedCommit[]
): ReadonlyMap<CommitType, readonly CategorizedCommit[]> {
  const groups = new Map<CommitType, CategorizedCommit[]>();

  for (const commit of commits) {
    const existing = groups.get(commit.type);
    if (existing !== undefined) {
      existing.push(commit);
    } else {
      groups.set(commit.type, [commit]);
    }
  }

  return groups;
}
