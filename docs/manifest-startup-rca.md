# Missing remote manifest: root cause analysis and resolution

## Summary

The broken MFE setup on `main` can leave the entire host blank when any configured
remote manifest is unavailable. The fix on `fix/manifest-startup` changes the
host's sharing strategy from `version-first` to `loaded-first`. Remote failures
then reach the existing React error boundaries after the host mounts.

## Impact and trigger

A missing, unreachable, or failing remote manifest prevents the host from
mounting in the broken configuration. Healthy remotes are also unavailable to
the user because React never renders the host UI.

The POC deliberately combines `version-first` with a runtime plugin that throws
from `errorLoadRemote`. This is a reproduced configuration failure, not a record
of a production incident.

## Root cause

1. `apps/web/src/index.tsx` asynchronously imports `bootstrap.tsx`.
2. The bootstrap imports React and React DOM, which are shared dependencies.
3. With `version-first`, federation loads configured remotes during shared
   dependency initialization to discover available shared versions.
4. An unavailable manifest causes remote resolution to fail. The `fail-fast`
   runtime plugin throws an error and preserves the original error as its cause.
5. Shared initialization fails before `createRoot(...).render(...)` runs.
   The bootstrap import rejects, leaving the page blank.

`RemoteBoundary` cannot catch this failure because it has not mounted. React
boundaries handle failures in their rendered descendants; they do not handle
an application bootstrap promise rejection. `Suspense` handles pending loads,
but does not provide an error fallback for rejected loads.

The runtime error observed during reproduction identified `afterResolve` as the
failing hook lifecycle. Although `version-first` introduces the startup dependency
on remote availability, an individual manifest failure can surface in remote
resolution rather than report `beforeLoadShare` directly.

## Resolution

In `apps/web/rsbuild.config.ts`, use:

```ts
shareStrategy: 'loaded-first',
runtimePlugins: ['./src/fail-fast.ts'],
```

`loaded-first` defers remote loading until a module is requested, allowing React
to mount using locally available shared dependencies. Catalog and Analytics use
lazy imports; Reports uses `loadRemote` inside a lazy component. Each is already
wrapped in its own `RemoteBoundary` and `Suspense`.

Keep the runtime plugin so a failed remote load rejects rather than silently
returning an unusable module. After mounting, that rejection reaches the relevant
React boundary, which renders an unavailable message and a reload button. Healthy
remotes continue to work.

This changes shared dependency selection: the host reuses loaded versions rather
than eagerly discovering versions across all remotes. React and React DOM remain
singletons with the existing required version. Keep shared dependency versions
compatible across applications.

## Reproduction and expected result

From the repository root, with ports 3000–3003 available:

```bash
REPORTS_MANIFEST_URL=http://localhost:3003/missing/mf-manifest.json pnpm run dev
```

The Reports server disables HTML fallback, so this missing manifest returns
HTTP 404. Open <http://localhost:3000>.

| Configuration | Expected behavior |
| --- | --- |
| `main`, missing Reports manifest | Bootstrap rejects; host remains blank |
| Fix branch, missing Reports manifest | Host and healthy remotes render; Reports shows “Reports is unavailable” |
| Fix branch, valid manifests | All three remotes render and remain interactive |

Restart without the environment override to restore the valid manifest URL.
For deployed hosts, rebuild and redeploy after changing the sharing strategy or
manifest URLs; those settings are part of the build.

## Validation

- Before the change, an isolated host on port 3100 remained blank with Reports
  unreachable. Its server log reported an uncaught bootstrap promise rejection
  from the runtime plugin during `afterResolve`.
- After the change, the same unreachable remote produced the Reports fallback
  while Catalog and Analytics rendered.
- With the Reports server running, the missing manifest returned HTTP 404 and
  the fixed host still rendered the Reports fallback and both healthy remotes.
- With valid manifests, all three remotes rendered and generating a report
  incremented the Reports counter.
- `pnpm run check`, `pnpm run typecheck`, `pnpm run test`, and `pnpm run build` passed.

The component test mocks federation loading, so it validates composition and
interaction rather than network or startup behavior. The browser checks cover
the actual federation failure path.

## Recovery and limits

Restore the remote or correct its manifest URL, then reload the host. A corrected
build-time manifest URL requires rebuilding the host. The current boundary uses
a full page reload; it does not automatically retry remote requests.

The fix contains remote loading failures. It does not repair invalid URLs,
deployment outages, CORS errors, or incompatible shared dependency versions.

## References

- [Module Federation sharing strategy and offline remotes](https://module-federation.io/configure/shareStrategy.html)
- [Module Federation remote error handling](https://module-federation.io/blog/error-load-remote.html)
