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
}

export default nextConfig
