# AGENTS.md

## Git workflow

Commit directly to `main` for this project. Do not create branches unless the
user explicitly requests one.

## Commands

Run commands from the repository root. The React application lives in
`apps/web`, including its Rsbuild and Rstest configs, assets, and tests.
Add applications under `apps/*` and shared packages under `packages/*`.

- `pnpm run dev` - Start the dev server
- `pnpm run build` - Build the app for production
- `pnpm run preview` - Preview the production build locally
- `pnpm run typecheck` - Type-check workspace packages

Root scripts use Turborepo to run tasks across workspace packages that define
the corresponding script. `dev` and `preview` start all applications;
`test:watch` runs the web app's tests. `preview` builds applications first.
Task dependencies and caching are configured in `turbo.json`.
App build output is in each application's `dist` directory.

## Docs

- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- Rstest: https://rstest.rs/llms.txt

## Tools

### Biome

- Run `pnpm run check` to lint your code
- Run `pnpm run format` to format your code

### Rstest

- Run `pnpm run test` to run tests
- Run `pnpm run test:watch` to run tests in watch mode

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
