/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static export for GitHub Pages deployment when API routes are removed
  output: process.env.GITHUB_ACTIONS ? 'export' : undefined,
  // Set basePath for GitHub Pages deployment
  basePath: process.env.GITHUB_ACTIONS ? '/show' : '',
  // Set assetPrefix for proper asset loading
  assetPrefix: process.env.GITHUB_ACTIONS ? '/show/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.GITHUB_ACTIONS ? '/show' : '',
  }
}

module.exports = nextConfig