import { useEffect } from 'react';

const ImagePreloader = ({ imageUrls = [] }) => {
  useEffect(() => {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;

    // Preload images immediately
    const preloadPromises = imageUrls.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(url); // Still resolve to continue
        img.src = url;
      });
    });

    Promise.allSettled(preloadPromises).then(() => {
      console.log('Images preloaded successfully');
    });
  }, [imageUrls]);

  return null; // This component doesn't render anything
};

export default ImagePreloader;