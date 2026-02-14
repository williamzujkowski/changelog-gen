import { describe, it, expect } from 'vitest';
import { parseGitOutput } from './git-reader.js';

describe('parseGitOutput', () => {
  it('parses structured git log output', () => {
    const raw = [
      'abc123<<SEP>>abc1<<SEP>>Alice<<SEP>>2026-02-13<<SEP>>feat: add login<<SEP>>body text<<REC>>',
      'def456<<SEP>>def4<<SEP>>Bob<<SEP>>2026-02-12<<SEP>>fix: resolve crash<<SEP>><<REC>>',
    ].join('');

    const commits = parseGitOutput(raw);
    expect(commits).toHaveLength(2);
    expect(commits[0]?.hash).toBe('abc123');
    expect(commits[0]?.shortHash).toBe('abc1');
    expect(commits[0]?.author).toBe('Alice');
    expect(commits[0]?.subject).toBe('feat: add login');
    expect(commits[0]?.body).toBe('body text');
    expect(commits[1]?.hash).toBe('def456');
    expect(commits[1]?.subject).toBe('fix: resolve crash');
  });

  it('returns empty for blank input', () => {
    expect(parseGitOutput('')).toHaveLength(0);
    expect(parseGitOutput('   ')).toHaveLength(0);
  });

  it('handles missing fields gracefully', () => {
    const raw = 'h<<SEP>>s<<SEP>><<SEP>><<SEP>>subject<<SEP>><<REC>>';
    const commits = parseGitOutput(raw);
    expect(commits).toHaveLength(1);
    expect(commits[0]?.hash).toBe('h');
    expect(commits[0]?.author).toBe('');
    expect(commits[0]?.subject).toBe('subject');
  });
});
