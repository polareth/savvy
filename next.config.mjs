import { WebpackPluginTevm } from '@tevm/bundler/webpack-plugin';

// Api keys
const etherscanApiKeys = {
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  ARBISCAN_API_KEY: process.env.ARBISCAN_API_KEY,
  BASESCAN_API_KEY: process.env.BASESCAN_API_KEY,
  OPTIMISTIC_ETHERSCAN_API_KEY: process.env.OPTIMISTIC_ETHERSCAN_API_KEY,
  POLYGONSCAN_API_KEY: process.env.POLYGONSCAN_API_KEY,
};

Object.keys(etherscanApiKeys).forEach((key) => {
  if (!etherscanApiKeys[key]) {
    console.warn(
      `No ${key} environment variable set. You may face throttling.`,
    );
  }
});

if (!process.env.ALCHEMY_API_KEY) {
  throw new Error('No ALCHEMY_API_KEY environment variable set.');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  webpack: (config, { webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'stream/web': 'web-streams-polyfill',
    };

    // Tevm plugin for bundling, resolving contracts and types
    config.plugins.push(new WebpackPluginTevm());

    // TODO TEMP fix for top-level await
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      }),
    );

    return config;
  },
  // These will get exposed to the browser
  env: {
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
  },
};

export default nextConfig;
