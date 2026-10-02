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

`build`, `test`, and `typecheck` run across workspace packages. `dev`,
`preview`, and `test:watch` target `@mf-manifest-handling/web`.
App build output is in `apps/web/dist`.

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
