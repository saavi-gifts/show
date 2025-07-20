/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable API routes for authentication and admin functionality
  // If you need static export for the main site, consider using ISR or separate build configs
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig