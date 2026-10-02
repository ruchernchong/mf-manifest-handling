# MF manifest handling

A pnpm monorepo with React apps built with Rsbuild and tasks managed by Turborepo.

```text
apps/
  analytics/           Analytics remote app
  catalog/             Catalog remote app
  reports/             Reports remote loaded with loadRemote()
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

All four applications register `ModuleFederationPlugin` directly from
`@module-federation/enhanced/rspack` through Rsbuild's `tools.rspack` option.

| Application | Role | Local URL | Exposed module |
| --- | --- | --- | --- |
| `apps/web` | Host | http://localhost:3000 | Consumes three remotes |
| `apps/catalog` | Remote | http://localhost:3001 | `catalog/App` |
| `apps/analytics` | Remote | http://localhost:3002 | `analytics/App` |
| `apps/reports` | Remote | http://localhost:3003 | `reports/App` |

The host lazily imports catalog and analytics and uses `loadRemote('reports/App')`
for reports. All remotes expose `./App` through their `mf-manifest.json` files.
React and React DOM are shared singletons. The host uses `loaded-first` to defer
remote loading until components request it. The fail-fast runtime plugin rejects
failed loads, allowing each mounted React boundary to show an unavailable message
without taking down the host or healthy remotes. Each remote can also run independently.

The broken startup POC is on `main`; `fix/manifest-startup` contains the resolution.
See [the root cause analysis and resolution](docs/manifest-startup-rca.md).

To reproduce an HTTP 404, run all servers with a nonexistent reports manifest:

```bash
REPORTS_MANIFEST_URL=http://localhost:3003/missing/mf-manifest.json pnpm run dev
```

The reports server disables HTML fallback so the missing JSON URL returns an
actual HTTP 404 instead of the SPA HTML page.

Open http://localhost:3000. The console should report the manifest error, while
the host renders Catalog, Analytics, and a “Reports is unavailable” message.
Restart with `pnpm run dev` (without the override) to load all three remotes
successfully. On `main`, the same missing manifest prevents the host from mounting.

For deployments, set `CATALOG_MANIFEST_URL`, `ANALYTICS_MANIFEST_URL`, and `REPORTS_MANIFEST_URL` when
building the host to the full remote manifest URLs. They default to the local
URLs above followed by `/mf-manifest.json`. Serve each remote's entire `dist`
directory and allow cross-origin manifest requests from the host origin.
Remote assets use an automatic public path based on their remote entry URL.

### Cloudflare Workers deployment

Each app includes a `wrangler.jsonc` that deploys its built `dist` directory as
static assets. This explicit config skips Wrangler's automatic project setup,
which can invoke npm and fail on pnpm's `catalog:` dependency references.

Create a separate Workers Builds project for each app with these settings:

| Root directory | Worker name | Build command | Deploy command |
| --- | --- | --- | --- |
| `apps/web` | `host-mfe` | `pnpm run build` | `pnpm exec wrangler deploy` |
| `apps/catalog` | `catalog-mfe` | `pnpm run build` | `pnpm exec wrangler deploy` |
| `apps/analytics` | `analytics-mfe` | `pnpm run build` | `pnpm exec wrangler deploy` |
| `apps/reports` | `reports-mfe` | `pnpm run build` | `pnpm exec wrangler deploy` |

The Worker names in Cloudflare must match the corresponding config's `name`.
Update the config names if your existing Workers use different names.
Keep dependency installation on `pnpm install --frozen-lockfile`.

Deploy the remotes first, then set `CATALOG_MANIFEST_URL` and
`ANALYTICS_MANIFEST_URL` and `REPORTS_MANIFEST_URL` in the host's build environment to their deployed
`/mf-manifest.json` URLs and rebuild the host. All remotes include a public
`_headers` file that allows cross-origin requests to their static assets.

To validate an app's deployment config locally without uploading, build it and
run Wrangler from the repository root with its explicit config, for example:

```bash
pnpm --filter @mf-manifest-handling/web run build
pnpm --filter @mf-manifest-handling/web exec wrangler deploy --dry-run
```

Automatic federation type generation is disabled to keep builds independent
of running remote servers. The host declares the exposed component contracts
in `apps/web/src/remotes.d.ts`; update those declarations if remote props change.
Component tests resolve remotes to local sources; browser verification covers
manifest loading across the four servers.

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get started

Start all app dev servers. The web app is available at [http://localhost:3000](http://localhost:3000),
with catalog on port 3001, analytics on port 3002, and reports on port 3003.

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
