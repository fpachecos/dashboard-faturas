/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignorar arquivos do Expo durante o build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config) => {
    // Ignorar a pasta app-expo durante o build
    config.module.rules.push({
      test: /app-expo\/.*/,
      use: 'ignore-loader',
    });
    return config;
  },
}

module.exports = nextConfig

