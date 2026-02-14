/**
 * Git log reader — parses git history into structured commits.
 */

import { execSync } from 'node:child_process';
import type { GitCommit } from './types.js';

/** Field separator for git log format. */
const SEP = '<<SEP>>';
const RECORD_SEP = '<<REC>>';

/**
 * Read commits from git log between two references.
 *
 * @param cwd - Working directory (git repo)
 * @param from - Start reference (tag, commit hash, or undefined for all)
 * @param to - End reference (default: HEAD)
 * @returns Array of parsed commits, newest first
 */
export function readGitLog(
  cwd: string,
  from: string | undefined,
  to: string = 'HEAD'
): readonly GitCommit[] {
  const range = from !== undefined ? `${from}..${to}` : to;
  const format = `%H${SEP}%h${SEP}%an${SEP}%aI${SEP}%s${SEP}%b${RECORD_SEP}`;

  const cmd = `git log --format="${format}" ${range}`;

  let output: string;
  try {
    output = execSync(cmd, { cwd, encoding: 'utf-8', timeout: 30_000 });
  } catch {
    return [];
  }

  return parseGitOutput(output);
}

/** Parse raw git log output into GitCommit objects. */
export function parseGitOutput(raw: string): readonly GitCommit[] {
  const records = raw.split(RECORD_SEP).filter((r) => r.trim().length > 0);

  return records.map((record) => {
    const fields = record.trim().split(SEP);
    return {
      hash: fields[0] ?? '',
      shortHash: fields[1] ?? '',
      author: fields[2] ?? '',
      date: fields[3] ?? '',
      subject: fields[4] ?? '',
      body: fields[5] ?? '',
    };
  });
}

/**
 * Get the latest git tag in the repo.
 *
 * @param cwd - Working directory
 * @returns Tag name or undefined if no tags exist
 */
export function getLatestTag(cwd: string): string | undefined {
  try {
    const tag = execSync('git describe --tags --abbrev=0', {
      cwd,
      encoding: 'utf-8',
      timeout: 10_000,
    }).trim();
    return tag.length > 0 ? tag : undefined;
  } catch {
    return undefined;
  }
}
