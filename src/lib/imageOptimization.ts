/**
 * Image Optimization Utilities
 * Provides functions for responsive image sizing and placeholder generation
 */

/**
 * Generate a responsive image srcset for different screen sizes
 * @param imagePath - Original image path
 * @param sizes - Array of image sizes to generate
 * @returns srcset string for responsive images
 */
export const generateImageSrcSet = (imagePath: string, sizes: number[] = [400, 600, 800, 1200]): string => {
  return sizes
    .map(size => `${imagePath}?w=${size} ${size}w`)
    .join(', ');
};

/**
 * Get optimized image URL with size parameters
 * @param imagePath - Original image path
 * @param width - Desired width
 * @param quality - Desired quality (default: 75)
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (imagePath: string, width?: number, quality: number = 75): string => {
  if (!imagePath) return '/placeholder.svg';
  
  // If it's already a placeholder or data URL, return as-is
  if (imagePath.includes('placeholder') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  // For external URLs or relative paths, add quality parameter
  const separator = imagePath.includes('?') ? '&' : '?';
  const params = [`quality=${quality}`];
  
  if (width) {
    params.push(`w=${width}`);
  }

  return `${imagePath}${separator}${params.join('&')}`;
};

/**
 * Generate a blurhash-style placeholder color based on image URL
 * @param url - Image URL
 * @returns RGB color string
 */
export const generatePlaceholderColor = (url: string): string => {
  // Generate a subtle placeholder color based on URL hash
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash) + url.charCodeAt(i);
    hash = hash & hash;
  }
  
  const hue = (hash % 360);
  const saturation = 15; // Low saturation for subtle effect
  const lightness = 92; // Light background
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Get sizes attribute for responsive images
 * @returns sizes string for img tag
 */
export const getResponsiveImageSizes = (): string => {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
};

/**
 * Image optimization configuration
 */
export const IMAGE_CONFIG = {
  // Thumbnail size
  THUMBNAIL: 200,
  // Small/mobile size
  SMALL: 400,
  // Medium size
  MEDIUM: 600,
  // Large/desktop size
  LARGE: 1200,
  // Product card typical width
  PRODUCT_CARD: 300,
  // Hero slider width
  HERO: 1920,
  // Default quality (0-100)
  QUALITY: 75,
  // High quality (for hero/featured images)
  QUALITY_HIGH: 85,
};
