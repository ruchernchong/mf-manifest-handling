import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  server: { port: 3003, strictPort: true, cors: true, htmlFallback: false },
  dev: { assetPrefix: true },
  output: { assetPrefix: 'auto' },
  html: { title: 'Reports MFE' },
  tools: {
    rspack: {
      output: { uniqueName: 'reports' },
      plugins: [
        new ModuleFederationPlugin({
          name: 'reports',
          filename: 'remoteEntry.js',
          manifest: true,
          shareStrategy: 'loaded-first',
          // Explicit host declarations keep builds independent of running remotes.
          dts: false,
          exposes: { './App': './src/App.tsx' },
          shared: {
            react: { singleton: true, requiredVersion: '19.3.0' },
            'react-dom': { singleton: true, requiredVersion: '19.3.0' },
          },
        }),
      ],
    },
  },
});
