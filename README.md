# MF manifest handling

A pnpm monorepo with React apps built with Rsbuild and tasks managed by Turborepo.

```text
apps/
  analytics/           Analytics remote app
  catalog/             Catalog remote app
  web/                 Host MFE, public assets, build config, and integration tests
biome.json             Workspace linting and formatting
pnpm-workspace.yaml    Workspace package discovery and exact dependency catalog
tsconfig.base.json     Shared TypeScript compiler options
turbo.json             Workspace task dependencies and caching
```

App dependencies live in each application's `package.json`. Shared tooling lives in the
root package. All workspace packages use the root `pnpm-lock.yaml`.
Dependency versions are defined once in the default `catalog` in
`pnpm-workspace.yaml`; package manifests reference them with `"catalog:"`.

## Micro-frontends

All three applications register `ModuleFederationPlugin` directly from
`@module-federation/enhanced/rspack` through Rsbuild's `tools.rspack` option.

| Application | Role | Local URL | Exposed module |
| --- | --- | --- | --- |
| `apps/web` | Host | http://localhost:3000 | Consumes both remotes |
| `apps/catalog` | Remote | http://localhost:3001 | `catalog/App` |
| `apps/analytics` | Remote | http://localhost:3002 | `analytics/App` |

The host lazily imports the remote components through their `mf-manifest.json`
files. Each remote also generates `remoteEntry.js` and can run independently.
React and React DOM are shared singletons with `loaded-first` sharing, which
avoids fetching unavailable remotes during host startup. Async bootstrap entries initialize
the federation share scope before rendering. Each remote has its own loading
and error boundary in the host, so one failed remote leaves the other usable.

For deployments, set `CATALOG_MANIFEST_URL` and `ANALYTICS_MANIFEST_URL` when
building the host to the full remote manifest URLs. They default to the local
URLs above followed by `/mf-manifest.json`. Serve each remote's entire `dist`
directory and allow cross-origin manifest requests from the host origin.
Remote assets use an automatic public path based on their remote entry URL.

Automatic federation type generation is disabled to keep builds independent
of running remote servers. The host declares the exposed component contracts
in `apps/web/src/remotes.d.ts`; update those declarations if remote props change.
Component tests resolve remotes to local sources; browser verification covers
manifest loading across the three servers.

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get started

Start all app dev servers. The web app is available at [http://localhost:3000](http://localhost:3000),
with catalog on port 3001 and analytics on port 3002.

```bash
pnpm run dev
```

Build the app for production:

```bash
pnpm run build
```

Build and preview all applications locally:

```bash
pnpm run preview
```

Each app builds to its own `dist` directory, including `apps/web/dist`.

Run workspace checks from the repository root:

```bash
pnpm run check
pnpm run typecheck
pnpm run test
```

Use `pnpm run format` to format the workspace and `pnpm run test:watch` to
watch the web app's tests.

Root `build`, `test`, and `typecheck` commands use Turborepo to run the
corresponding scripts across workspace packages and cache successful results.
Build artifacts in `dist` are restored on cache hits. Root `dev` and `preview`
commands start all applications; `test:watch` runs packages with a watch script.
Long-running tasks are persistent and uncached. Task configuration lives in
`turbo.json`; local cache files in `.turbo` are ignored by Git.

Add new applications under `apps/*` and shared packages under `packages/*`,
each with its own `package.json` and applicable scripts. Use `workspace:*`
for dependencies between workspace packages, and extend `tsconfig.base.json`
from package TypeScript configs.

## Learn more

To learn more about Rsbuild, check out the following resources:

- [Rsbuild documentation](https://rsbuild.rs) - explore Rsbuild features and APIs.
- [Rsbuild GitHub repository](https://github.com/web-infra-dev/rsbuild) - your feedback and contributions are welcome!
