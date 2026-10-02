import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export default function failFast(): ModuleFederationRuntimePlugin {
  return {
    name: 'fail-fast',
    errorLoadRemote({ id, lifecycle, error }) {
      throw Object.assign(
        new Error(`Remote ${id} failed during ${lifecycle}`),
        {
          cause: error,
        },
      );
    },
  };
}
