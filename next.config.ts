import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration for sql.js compatibility
  webpack: (config, { isServer }) => {
    // Handle sql.js in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Handle sql.js wasm files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Add rule for WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Ensure proper handling of sql.js - exclude from server bundle
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('sql.js');
    } else {
      config.resolve.alias = {
        ...config.resolve.alias,
        'sql.js': 'sql.js/dist/sql-wasm.js',
      };
    }

    return config;
  },
  
  // Ensure static assets are properly served
  async headers() {
    return [
      {
        source: '/sql-wasm.wasm',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
