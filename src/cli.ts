#!/usr/bin/env node
/**
 * changelog-gen CLI entry point.
 *
 * Usage:
 *   changelog-gen [options]
 *   changelog-gen --from v1.0.0 --to HEAD --format markdown
 */

import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { generateFormattedChangelog } from './index.js';
import type { OutputFormat } from './types.js';

const VALID_FORMATS = new Set<OutputFormat>(['markdown', 'json', 'text']);

function main(): void {
  const { values } = parseArgs({
    options: {
      from: { type: 'string', short: 'f' },
      to: { type: 'string', short: 't', default: 'HEAD' },
      format: { type: 'string', default: 'markdown' },
      cwd: { type: 'string', short: 'C', default: '.' },
      help: { type: 'boolean', short: 'h', default: false },
    },
    strict: true,
  });

  if (values.help === true) {
    printHelp();
    process.exit(0);
  }

  const format = values.format as string;
  if (!VALID_FORMATS.has(format as OutputFormat)) {
    process.stderr.write(
      `Error: Invalid format "${format}". Use: markdown, json, text\n`
    );
    process.exit(1);
  }

  const output = generateFormattedChangelog({
    cwd: resolve(values.cwd as string),
    from: values.from as string | undefined,
    to: values.to as string,
    format: format as OutputFormat,
    group: true,
  });

  process.stdout.write(output + '\n');
}

function printHelp(): void {
  process.stdout.write(`
changelog-gen — Generate categorized changelogs from git history

Usage:
  changelog-gen [options]

Options:
  -f, --from <ref>     Start reference (tag or commit hash)
  -t, --to <ref>       End reference (default: HEAD)
  --format <fmt>       Output format: markdown, json, text (default: markdown)
  -C, --cwd <dir>      Repository directory (default: .)
  -h, --help           Show this help

Examples:
  changelog-gen                              # All commits as markdown
  changelog-gen --from v1.0.0               # Since tag v1.0.0
  changelog-gen --format json --from v2.0.0 # JSON output since v2.0.0
  changelog-gen -C /path/to/repo            # Different repo directory
`);
}

main();
