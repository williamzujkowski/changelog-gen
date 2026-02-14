import { describe, it, expect } from 'vitest';
import { categorizeCommit, categorizeAll, groupByType } from './categorizer.js';
import type { GitCommit } from './types.js';

function makeCommit(subject: string, body = ''): GitCommit {
  return {
    hash: 'abc123def456',
    shortHash: 'abc123d',
    author: 'Test Author',
    date: '2026-02-13T12:00:00-05:00',
    subject,
    body,
  };
}

describe('categorizeCommit', () => {
  it('parses feat commit', () => {
    const result = categorizeCommit(makeCommit('feat: add login page'));
    expect(result.type).toBe('feat');
    expect(result.description).toBe('add login page');
    expect(result.scope).toBeUndefined();
    expect(result.breaking).toBe(false);
  });

  it('parses fix commit with scope', () => {
    const result = categorizeCommit(makeCommit('fix(auth): resolve token expiry'));
    expect(result.type).toBe('fix');
    expect(result.scope).toBe('auth');
    expect(result.description).toBe('resolve token expiry');
  });

  it('detects breaking change via !', () => {
    const result = categorizeCommit(makeCommit('feat!: remove deprecated API'));
    expect(result.type).toBe('feat');
    expect(result.breaking).toBe(true);
  });

  it('detects breaking change via body', () => {
    const result = categorizeCommit(
      makeCommit('refactor: change return type', 'BREAKING CHANGE: returns Promise now')
    );
    expect(result.type).toBe('refactor');
    expect(result.breaking).toBe(true);
  });

  it('classifies non-conventional as other', () => {
    const result = categorizeCommit(makeCommit('Update README'));
    expect(result.type).toBe('other');
    expect(result.description).toBe('Update README');
  });

  it('classifies unknown type as other', () => {
    const result = categorizeCommit(makeCommit('yolo: skip tests'));
    expect(result.type).toBe('other');
  });

  it('handles all valid types', () => {
    const types = ['feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'perf', 'ci', 'style', 'build'];
    for (const type of types) {
      const result = categorizeCommit(makeCommit(`${type}: something`));
      expect(result.type).toBe(type);
    }
  });
});

describe('categorizeAll', () => {
  it('categorizes multiple commits', () => {
    const commits = [
      makeCommit('feat: add X'),
      makeCommit('fix: fix Y'),
      makeCommit('random message'),
    ];
    const result = categorizeAll(commits);
    expect(result).toHaveLength(3);
    expect(result[0]?.type).toBe('feat');
    expect(result[1]?.type).toBe('fix');
    expect(result[2]?.type).toBe('other');
  });

  it('returns empty for empty input', () => {
    expect(categorizeAll([])).toHaveLength(0);
  });
});

describe('groupByType', () => {
  it('groups commits by type', () => {
    const commits = categorizeAll([
      makeCommit('feat: A'),
      makeCommit('feat: B'),
      makeCommit('fix: C'),
    ]);
    const groups = groupByType(commits);
    expect(groups.get('feat')).toHaveLength(2);
    expect(groups.get('fix')).toHaveLength(1);
    expect(groups.has('other')).toBe(false);
  });
});
