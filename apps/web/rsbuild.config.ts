import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact({ reactCompiler: true })],
  server: { port: 3000, strictPort: true },
  html: { title: 'Module Federation Host' },
  tools: {
    rspack: {
      output: { uniqueName: 'host' },
      plugins: [
        new ModuleFederationPlugin({
          name: 'host',
          manifest: true,
          // Load remotes after React mounts so failures reach RemoteBoundary.
          shareStrategy: 'loaded-first',
          runtimePlugins: ['./src/fail-fast.ts'],
          dts: false,
          remotes: {
            reports: `reports@${process.env.REPORTS_MANIFEST_URL || 'http://localhost:3003/mf-manifest.json'}`,
            catalog: `catalog@${process.env.CATALOG_MANIFEST_URL || 'http://localhost:3001/mf-manifest.json'}`,
            analytics: `analytics@${process.env.ANALYTICS_MANIFEST_URL || 'http://localhost:3002/mf-manifest.json'}`,
          },
          shared: {
            react: { singleton: true, requiredVersion: '19.3.0' },
            'react-dom': { singleton: true, requiredVersion: '19.3.0' },
          },
        }),
      ],
    },
  },
});
