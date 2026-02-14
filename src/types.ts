/**
 * Core types for changelog-gen.
 */

/** A parsed git commit. */
export interface GitCommit {
  readonly hash: string;
  readonly shortHash: string;
  readonly author: string;
  readonly date: string;
  readonly subject: string;
  readonly body: string;
}

/** A commit classified by conventional commit type. */
export interface CategorizedCommit {
  readonly commit: GitCommit;
  readonly type: CommitType;
  readonly scope: string | undefined;
  readonly description: string;
  readonly breaking: boolean;
}

/** Supported conventional commit types. */
export type CommitType =
  | 'feat'
  | 'fix'
  | 'refactor'
  | 'docs'
  | 'test'
  | 'chore'
  | 'perf'
  | 'ci'
  | 'style'
  | 'build'
  | 'other';

/** Human-readable category labels. */
export const CATEGORY_LABELS: Record<CommitType, string> = {
  feat: 'Features',
  fix: 'Bug Fixes',
  refactor: 'Refactoring',
  docs: 'Documentation',
  test: 'Tests',
  chore: 'Chores',
  perf: 'Performance',
  ci: 'CI/CD',
  style: 'Style',
  build: 'Build',
  other: 'Other Changes',
};

/** Output format options. */
export type OutputFormat = 'markdown' | 'json' | 'text';

/** CLI options. */
export interface ChangelogOptions {
  readonly cwd: string;
  readonly from: string | undefined;
  readonly to: string;
  readonly format: OutputFormat;
  readonly group: boolean;
}

/** Generated changelog result. */
export interface ChangelogResult {
  readonly commits: readonly CategorizedCommit[];
  readonly grouped: ReadonlyMap<CommitType, readonly CategorizedCommit[]>;
  readonly from: string | undefined;
  readonly to: string;
  readonly generatedAt: string;
}
