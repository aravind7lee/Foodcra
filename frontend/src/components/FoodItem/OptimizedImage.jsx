import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ src, fallbackSrc, alt, className, onError, ...props }) => {
  const [imageSrc, setImageSrc] = useState(fallbackSrc || src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Always start with fallback for immediate display if available
    if (fallbackSrc) {
      setImageSrc(fallbackSrc);
      setIsLoaded(true);
      setShowFallback(true);
      setHasError(false);
      
      // Only try to load backend image if it's different from fallback
      if (src !== fallbackSrc) {
        const img = new Image();
        img.onload = () => {
          setImageSrc(src);
          setShowFallback(false);
        };
        img.onerror = () => {
          // Keep fallback image, no error state needed
          setHasError(false);
        };
        img.src = src;
      }
    } else {
      // No fallback available, load main image
      setImageSrc(src);
      setIsLoaded(false);
      setHasError(false);
      setShowFallback(false);
    }
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    if (!hasError && fallbackSrc && !showFallback) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      setShowFallback(true);
      e.target.dataset.fallbackUsed = 'true';
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        opacity: 1,
        transition: 'opacity 0.2s ease',
        backgroundColor: '#f5f5f5',
        ...props.style
      }}
    />
  );
};

export default OptimizedImage;