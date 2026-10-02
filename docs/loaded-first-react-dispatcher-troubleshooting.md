# ReactCurrentDispatcher errors with `loaded-first`

This note covers possible causes of the following error after changing Module Federation's `shareStrategy` to `loaded-first`:

```text
Cannot read properties of undefined (reading 'ReactCurrentDispatcher')
```

The issue was reported outside this repository. These are diagnostic hypotheses, not a confirmed root cause.

## Dependency ownership and coordination

We do not directly control the affected dependency. We need to reach out to the team that owns it and work together to investigate the issue and agree on a potential fix. Share the stack trace, runtime React/ReactDOM versions, and federation sharing configuration with that team to help identify any compatibility or configuration changes needed.

## Why changing the strategy can expose this

`loaded-first` prioritizes reuse of already loaded shared dependencies and loads remotes on demand. A dependency can therefore receive a different React version than it received under `version-first`. It does not guarantee that the host's React always wins.

The strongest suspect is a React compatibility mismatch exposed by the change in dependency selection or initialization order.

Source: [Module Federation sharing strategy](https://module-federation.io/configure/shareStrategy.html).

## Potential causes

### 1. React 18 code receives React 19

Older ReactDOM, JSX runtimes, renderers, or libraries may access React internals using an expression such as:

```js
React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher
```

React 19 changed these internals. If the internal object is absent, reading its `ReactCurrentDispatcher` property produces this error.

This is the leading hypothesis if any host or remote uses React 19. Identify the package executing the failing access before concluding that it is the cause.

Source: [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide).

### 2. React and ReactDOM resolve to incompatible versions

`react` and `react-dom` are separate shared packages. Selecting a singleton for each does not ensure that they form a compatible pair. For example, already loaded React 19 may coexist with a remote's ReactDOM 18.

Check the actual versions used at runtime, including custom renderers, rather than relying only on declared dependencies.

Source: [React troubleshooting: mismatching versions and duplicate React](https://react.dev/warnings/invalid-hook-call-warning).

### 3. Sharing configuration permits an incompatible version

Compare every host and remote for:

- Inconsistent `singleton` settings.
- Overly broad or disabled `requiredVersion` constraints.
- Different share scopes.
- Version validation settings that allow an incompatible selection to continue.

`singleton: true` controls instance reuse; it does not make different React majors compatible.

Source: [Module Federation shared configuration](https://module-federation.io/configure/shared).

### 4. Some React imports bypass sharing

A dependency may bundle its own React, or subpath imports may not be covered by the federation plugin's sharing configuration. Relevant imports include:

- `react/jsx-runtime`
- `react/jsx-dev-runtime`
- `react-dom/client`

An older JSX runtime receiving newer React is particularly relevant to this error. Duplicate React instances more commonly produce an “Invalid hook call,” so duplication alone does not prove the cause of a missing internal object.

Check subpath sharing support for the specific plugin and version in use.

Source: [Module Federation runtime troubleshooting](https://module-federation.io/guide/troubleshooting/runtime.html).

### 5. A shared factory returns the wrong React module shape

If shared modules are registered manually or resolution is customized, a factory might return an ESM namespace wrapper, promise, or another incorrect module shape. The consumer could then receive an object without the expected React internals.

This is a secondary hypothesis if all React versions match. Inspect the value received by the failing consumer and verify that the factory follows the runtime API contract.

Source: [Module Federation runtime API](https://module-federation.io/guide/runtime/runtime-api.html).

## How to narrow it down

1. Pause on the exception in browser developer tools. Identify the first failing package and the expression immediately before `.ReactCurrentDispatcher`.
2. Inspect the actual React version and module shape available to that consumer.
3. Inspect the actual ReactDOM or renderer version used by the same application.
4. Inspect `__FEDERATION__.__SHARE__` for registered versions, providers (`from`), share scopes, and loaded status.
5. Compare the host and remote sharing configurations, including version constraints and subpath imports.
6. Compare a fresh page load under each strategy. If relevant, vary remote navigation order to check whether the outcome depends on which dependencies load first.

If switching back to `version-first` fixes the issue, that points toward dependency selection or initialization order. It does not establish which mismatch exists or guarantee compatibility.

The most useful evidence is the stack trace, the host and remote React/ReactDOM versions, and the runtime sharing state.

Source: [Module Federation runtime debugging variables](https://module-federation.io/guide/debug/variables.html).
