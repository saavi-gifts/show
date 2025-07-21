/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static export for GitHub Pages deployment when API routes are removed
  output: process.env.GITHUB_ACTIONS ? 'export' : undefined,
  // Set basePath for GitHub Pages deployment
  basePath: process.env.GITHUB_ACTIONS ? '/show' : '',
  // Set assetPrefix for proper asset loading
  assetPrefix: process.env.GITHUB_ACTIONS ? '/show' : '',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.GITHUB_ACTIONS ? '/show' : '',
    // Set NEXTAUTH_URL for GitHub Pages deployment to fix authentication redirects
    NEXTAUTH_URL: process.env.GITHUB_ACTIONS ? 'https://saavi-gifts.github.io/show' : process.env.NEXTAUTH_URL || 'http://localhost:3000',
    // Admin credentials for static deployment
    NEXT_PUBLIC_ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
    NEXT_PUBLIC_ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  }
}

module.exports = nextConfig