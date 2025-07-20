/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static export for GitHub Pages deployment when API routes are removed
  output: process.env.GITHUB_ACTIONS ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig