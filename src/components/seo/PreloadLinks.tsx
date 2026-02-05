import { useEffect } from 'react';

interface PreloadLinksProps {
  heroImages?: string[];
}

/**
 * Component to add preload links to the document head
 * Preloads critical images that should load immediately
 */
export const PreloadLinks = ({ heroImages = [] }: PreloadLinksProps) => {
  useEffect(() => {
    // Preload hero images
    heroImages.slice(0, 2).forEach((src) => {
      if (!src) return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup old preload links
      document.head.querySelectorAll('link[rel="preload"][as="image"]').forEach((link) => {
        if (heroImages.includes(link.getAttribute('href') || '')) {
          link.remove();
        }
      });
    };
  }, [heroImages]);

  return null;
};

export default PreloadLinks;
