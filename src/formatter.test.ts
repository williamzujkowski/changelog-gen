import { describe, it, expect } from 'vitest';
import { formatChangelog } from './formatter.js';
import { categorizeAll, groupByType } from './categorizer.js';
import type { ChangelogResult, GitCommit } from './types.js';

function makeResult(subjects: string[]): ChangelogResult {
  const commits: GitCommit[] = subjects.map((s, i) => ({
    hash: `hash${String(i)}`,
    shortHash: `h${String(i)}`,
    author: 'Author',
    date: '2026-02-13',
    subject: s,
    body: '',
  }));
  const categorized = categorizeAll(commits);
  return {
    commits: categorized,
    grouped: groupByType(categorized),
    from: 'v1.0.0',
    to: 'HEAD',
    generatedAt: '2026-02-13T12:00:00Z',
  };
}

describe('formatChangelog', () => {
  describe('markdown', () => {
    it('includes category headers', () => {
      const result = makeResult(['feat: add X', 'fix: fix Y']);
      const md = formatChangelog(result, 'markdown');
      expect(md).toContain('## Features');
      expect(md).toContain('## Bug Fixes');
      expect(md).toContain('add X');
      expect(md).toContain('fix Y');
    });

    it('shows breaking changes section', () => {
      const result = makeResult(['feat!: remove API']);
      const md = formatChangelog(result, 'markdown');
      expect(md).toContain('## BREAKING CHANGES');
    });

    it('shows empty message for no commits', () => {
      const result = makeResult([]);
      const md = formatChangelog(result, 'markdown');
      expect(md).toContain('No commits found');
    });
  });

  describe('json', () => {
    it('returns valid JSON with categories', () => {
      const result = makeResult(['feat: add X', 'fix: fix Y']);
      const json = formatChangelog(result, 'json');
      const parsed = JSON.parse(json) as Record<string, unknown>;
      expect(parsed['totalCommits']).toBe(2);
      expect(parsed['from']).toBe('v1.0.0');
    });
  });

  describe('text', () => {
    it('includes category labels and descriptions', () => {
      const result = makeResult(['feat: add X', 'docs: update readme']);
      const text = formatChangelog(result, 'text');
      expect(text).toContain('Features:');
      expect(text).toContain('Documentation:');
      expect(text).toContain('add X');
    });

    it('marks breaking changes', () => {
      const result = makeResult(['feat!: break stuff']);
      const text = formatChangelog(result, 'text');
      expect(text).toContain('[BREAKING]');
    });
  });
});
