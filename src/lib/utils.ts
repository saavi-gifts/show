/**
 * Get the full path for a static asset with basePath prefix
 * @param path - The asset path starting with /
 * @returns The full path with basePath prefix for GitHub Pages deployment
 */
export function getAssetPath(path: string): string {
  // For GitHub Pages deployment, add /show prefix
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${basePath}${path}`
}

/**
 * Get the full path for a page with basePath prefix
 * @param path - The page path starting with /
 * @returns The full path with basePath prefix for GitHub Pages deployment
 */
export function getPagePath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${basePath}${path}`
}

/**
 * Get the full path for an API endpoint with basePath prefix
 * @param path - The API path starting with /api
 * @returns The full path with basePath prefix for GitHub Pages deployment
 */
export function getApiPath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${basePath}${path}`
}