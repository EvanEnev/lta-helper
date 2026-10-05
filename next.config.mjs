/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', '::1', 'localhost'],
  serverExternalPackages: [
    'sharp',
    'pg',
    'semver',
    'jszip',
    'readable-stream',
    'glob',
    'fstream',
    'googleapis',
    'googleapis-common',
    'winston',
  ],
  typescript: {ignoreBuildErrors: true},
  experimental: {
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
    cpus: 2,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
  },
}

export default nextConfig
