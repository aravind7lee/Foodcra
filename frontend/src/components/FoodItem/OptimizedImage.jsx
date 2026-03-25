import React, { useState, useEffect, useRef } from 'react';

const OptimizedImage = ({ src, fallbackSrc, alt, className, onError, ...props }) => {
  const [imageSrc, setImageSrc] = useState(fallbackSrc || src);
  const [isLoaded, setIsLoaded] = useState(!!fallbackSrc); // Immediately loaded if fallback exists
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Priority: Always show fallback immediately for instant display
    if (fallbackSrc) {
      setImageSrc(fallbackSrc);
      setIsLoaded(true);
      setHasError(false);
      
      // Try to load backend image in background if different
      if (src && src !== fallbackSrc && !src.includes('/src/assets/')) {
        const img = new Image();
        img.onload = () => {
          // Silently switch to backend image when ready
          setImageSrc(src);
        };
        img.onerror = () => {
          // Keep fallback, no error needed
        };
        img.src = src;
      }
    } else {
      // No fallback, load main image directly
      setImageSrc(src);
      setIsLoaded(false);
      setHasError(false);
    }
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      setIsLoaded(true);
      e.target.dataset.fallbackUsed = 'true';
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      {...props}
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="eager"
      decoding="async"
      style={{
        opacity: 1,
        transition: 'none',
        backgroundColor: '#f5f5f5',
        display: 'block',
        ...props.style
      }}
    />
  );
};

export default OptimizedImage;