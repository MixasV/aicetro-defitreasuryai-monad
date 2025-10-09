/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false
    };

    return config;
  }
};

export default nextConfig;
