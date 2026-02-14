# changelog-gen

Generate categorized changelogs from git history. A standalone utility built as part of the [nexus-agents](https://github.com/williamzujkowski/nexus-agents) E2E test ecosystem.

## Quick start

```bash
pnpm install
pnpm test        # Run unit tests
pnpm typecheck   # TypeScript strict check
pnpm build       # Compile to dist/
```

## Usage

```typescript
import { generateFormattedChangelog } from 'changelog-gen';

const changelog = generateFormattedChangelog({
  fromRef: 'v2.13.0',
  toRef: 'HEAD',
  format: 'markdown',
});

console.log(changelog);
```

## License

MIT
