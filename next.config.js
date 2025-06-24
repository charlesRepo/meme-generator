/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isExport = process.env.NEXT_EXPORT === 'true';

const nextConfig = {
  ...(isExport ? { output: 'export' } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: isProd ? '/meme-generator' : '',
  assetPrefix: isProd ? '/meme-generator/' : '',
}

module.exports = nextConfig
