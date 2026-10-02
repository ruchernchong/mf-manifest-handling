# MF manifest handling

A pnpm monorepo with a React app built with Rsbuild.

```text
apps/
  web/                 React app, public assets, build config, and tests
biome.json             Workspace linting and formatting
pnpm-workspace.yaml    Workspace package discovery
tsconfig.base.json     Shared TypeScript compiler options
```

App dependencies live in `apps/web/package.json`. Shared tooling lives in the
root package. All workspace packages use the root `pnpm-lock.yaml`.

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get started

Start the dev server, and the app will be available at [http://localhost:3000](http://localhost:3000).

```bash
pnpm run dev
```

Build the app for production:

```bash
pnpm run build
```

Preview the production build locally:

```bash
pnpm run preview
```

The web app builds to `apps/web/dist`.

Run workspace checks from the repository root:

```bash
pnpm run check
pnpm run typecheck
pnpm run test
```

Use `pnpm run format` to format the workspace and `pnpm run test:watch` to
watch the web app's tests.

Root `build`, `test`, and `typecheck` commands run the corresponding scripts
across workspace packages. Root `dev`, `preview`, and `test:watch` commands
target the web app. You can also run app commands directly:

```bash
pnpm --filter @mf-manifest-handling/web run build
```

Add new applications under `apps/*` and shared packages under `packages/*`,
each with its own `package.json` and applicable scripts. Use `workspace:*`
for dependencies between workspace packages, and extend `tsconfig.base.json`
from package TypeScript configs.

## Learn more

To learn more about Rsbuild, check out the following resources:

- [Rsbuild documentation](https://rsbuild.rs) - explore Rsbuild features and APIs.
- [Rsbuild GitHub repository](https://github.com/web-infra-dev/rsbuild) - your feedback and contributions are welcome!
